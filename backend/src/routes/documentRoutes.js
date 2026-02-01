const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Document = require('../models/Document');
const authMiddleware = require('../middleware/auth');

// ─────────────────────────────────────────────
// Multer configuration
// ─────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/msword': 'docx',
    'text/plain': 'txt'
};
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt'];

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Custom storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create org-specific subfolder
        const orgFolder = path.join(UPLOAD_DIR, req.user.organizationId.toString());
        if (!fs.existsSync(orgFolder)) {
            fs.mkdirSync(orgFolder, { recursive: true });
        }
        cb(null, orgFolder);
    },
    filename: function (req, file, cb) {
        const uniqueId = crypto.randomBytes(12).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase();
        const safeName = `${uniqueId}${ext}`;
        cb(null, safeName);
    }
});

// File filter
const fileFilter = function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed: PDF, DOCX, TXT`));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE }
});

// ─────────────────────────────────────────────
// Helper: resolve MIME → fileType
// ─────────────────────────────────────────────
function resolveFileType(file) {
    if (ALLOWED_TYPES[file.mimetype]) return ALLOWED_TYPES[file.mimetype];
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (['pdf', 'docx', 'doc', 'txt'].includes(ext)) {
        return ext === 'doc' ? 'docx' : ext;
    }
    return 'txt'; // fallback
}

// ─────────────────────────────────────────────
// POST /api/documents/upload
// ─────────────────────────────────────────────
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileType = resolveFileType(req.file);

        const document = await Document.create({
            organizationId: req.user.organizationId,
            uploadedBy: req.user._id,
            filename: req.file.filename,
            originalName: req.file.originalname,
            fileSize: req.file.size,
            fileType,
            filePath: req.file.path,
            status: 'uploaded'
        });

        // Populate uploader info before returning
        await document.populate('uploadedBy', 'name email');

        res.status(201).json({
            message: 'Document uploaded successfully',
            document: {
                _id: document._id,
                originalName: document.originalName,
                fileType: document.fileType,
                fileSize: document.fileSize,
                fileSizeMB: document.fileSizeMB,
                status: document.status,
                uploadedBy: document.uploadedBy,
                uploadedAt: document.uploadedAt
            }
        });
    } catch (error) {
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 10 MB.' });
        }

        console.error('Upload error:', error);
        res.status(500).json({ message: error.message || 'Upload failed' });
    }
});

// ─────────────────────────────────────────────
// GET /api/documents
// ─────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { status, uploadedBy, page = 1, limit = 20 } = req.query;

        const query = {
            organizationId: req.user.organizationId,
            isDeleted: false
        };

        if (status) query.status = status;
        if (uploadedBy) query.uploadedBy = uploadedBy;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [documents, total] = await Promise.all([
            Document.find(query)
                .populate('uploadedBy', 'name email')
                .sort({ uploadedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Document.countDocuments(query)
        ]);

        res.json({
            documents,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('List documents error:', error);
        res.status(500).json({ message: 'Failed to fetch documents' });
    }
});

// ─────────────────────────────────────────────
// GET /api/documents/:id
// ─────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        })
            .populate('uploadedBy', 'name email')
            .lean();

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.json({ document });
    } catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({ message: 'Failed to fetch document' });
    }
});

// ─────────────────────────────────────────────
// DELETE /api/documents/:id
// ─────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId,
            isDeleted: false
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Only owner or uploader can delete
        const isOwner = req.user.role === 'owner' || req.user.role === 'admin';
        const isUploader = document.uploadedBy.toString() === req.user._id.toString();

        if (!isOwner && !isUploader) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        // Delete physical file
        if (document.filePath && fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
        }

        // Soft delete
        await document.softDelete(req.user._id);

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ message: 'Failed to delete document' });
    }
});

module.exports = router;