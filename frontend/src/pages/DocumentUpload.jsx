import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    FileText,
    X,
    CheckCircle,
    AlertCircle,
    CloudUpload,
    Loader2
} from 'lucide-react';
import axios from 'axios';

const DocumentUpload = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]); // { file, status, progress, error, docId }

    // ─── Validation ───────────────────────────────
    const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];
    const MAX_SIZE_MB = 10;

    const validateFile = (file) => {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return `Invalid type. Allowed: PDF, DOCX, TXT`;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            return `File too large. Max ${MAX_SIZE_MB} MB`;
        }
        return null;
    };

    // ─── File handling ────────────────────────────
    const addFiles = useCallback((newFiles) => {
        const validated = Array.from(newFiles).map((file) => {
            const error = validateFile(file);
            return { file, status: error ? 'error' : 'pending', progress: 0, error, docId: null };
        });
        setFiles((prev) => [...prev, ...validated]);
    }, []);

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // ─── Drag & drop handlers ─────────────────────
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    };

    const handleFileInput = (e) => {
        if (e.target.files?.length) addFiles(e.target.files);
        e.target.value = ''; // reset so same file can be re-added
    };

    // ─── Upload logic ─────────────────────────────
    const uploadFile = async (index) => {
        const item = files[index];
        if (item.status !== 'pending') return;

        setFiles((prev) =>
            prev.map((f, i) => (i === index ? { ...f, status: 'uploading', progress: 0 } : f))
        );

        const formData = new FormData();
        formData.append('file', item.file);

        try {
            const res = await axios.post('/api/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    setFiles((prev) =>
                        prev.map((f, i) => (i === index ? { ...f, progress: pct } : f))
                    );
                }
            });

            setFiles((prev) =>
                prev.map((f, i) =>
                    i === index ? { ...f, status: 'success', docId: res.data.document._id } : f
                )
            );
        } catch (err) {
            const msg = err.response?.data?.message || 'Upload failed';
            setFiles((prev) =>
                prev.map((f, i) => (i === index ? { ...f, status: 'error', error: msg } : f))
            );
        }
    };

    const uploadAll = () => {
        files.forEach((f, i) => {
            if (f.status === 'pending') uploadFile(i);
        });
    };

    // ─── Derived state ────────────────────────────
    const hasPending = files.some((f) => f.status === 'pending');
    const hasSuccess = files.some((f) => f.status === 'success');
    const allDone = files.length > 0 && files.every((f) => f.status === 'success' || f.status === 'error');

    // ─── Helpers ──────────────────────────────────
    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const statusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-gray-400';
            case 'uploading': return 'text-indigo-400';
            case 'success': return 'text-emerald-400';
            case 'error': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    // ─── Render ───────────────────────────────────
    return (
        <div className="min-h-full p-6 lg:p-10">
            <div className="max-w-3xl mx-auto">

                {/* Page header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">Upload Documents</h1>
                    <p className="text-gray-400 mt-1">
                        Upload SRS documents for requirement extraction and analysis
                    </p>
                </div>

                {/* Drop zone */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
            relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
            ${dragActive
                            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                            : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/8'
                        }
          `}
                    onClick={() => document.getElementById('file-input').click()}
                >
                    <input
                        id="file-input"
                        type="file"
                        multiple
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileInput}
                        className="sr-only"
                    />

                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        {/* Icon */}
                        <div className={`
              w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300
              ${dragActive ? 'bg-indigo-500/30' : 'bg-white/10'}
            `}>
                            <CloudUpload className={`w-8 h-8 ${dragActive ? 'text-indigo-400' : 'text-gray-400'}`} />
                        </div>

                        {/* Text */}
                        <p className="text-white font-semibold text-lg">
                            {dragActive ? 'Drop files here' : 'Drag & drop files here'}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                            or click to browse
                        </p>

                        {/* Allowed info */}
                        <div className="flex items-center gap-3 mt-5 flex-wrap justify-center">
                            {['PDF', 'DOCX', 'TXT'].map((ext) => (
                                <span
                                    key={ext}
                                    className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-xs text-gray-400 font-medium"
                                >
                                    {ext}
                                </span>
                            ))}
                            <span className="text-xs text-gray-600">· Max 10 MB each</span>
                        </div>
                    </div>
                </motion.div>

                {/* File queue */}
                <AnimatePresence>
                    {files.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 space-y-3"
                        >
                            {files.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -12 }}
                                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Icon / Status */}
                                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                            {item.status === 'success' ? (
                                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                            ) : item.status === 'error' ? (
                                                <AlertCircle className="w-5 h-5 text-red-400" />
                                            ) : item.status === 'uploading' ? (
                                                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                                            ) : (
                                                <FileText className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-white truncate">{item.file.name}</p>
                                                <span className={`text-xs font-medium capitalize ${statusColor(item.status)}`}>
                                                    {item.status === 'uploading' ? `${item.progress}%` : item.status}
                                                </span>
                                            </div>

                                            {/* Progress bar */}
                                            {(item.status === 'uploading' || item.status === 'success') && (
                                                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${item.status === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                        style={{ width: `${item.status === 'success' ? 100 : item.progress}%` }}
                                                    />
                                                </div>
                                            )}

                                            {/* Size / Error */}
                                            {item.status === 'error' && item.error ? (
                                                <p className="text-xs text-red-400 mt-1">{item.error}</p>
                                            ) : (
                                                <p className="text-xs text-gray-500 mt-1">{formatSize(item.file.size)}</p>
                                            )}
                                        </div>

                                        {/* Remove button (only if not uploading) */}
                                        {item.status !== 'uploading' && (
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Action buttons */}
                <AnimatePresence>
                    {files.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between mt-6"
                        >
                            <button
                                onClick={() => setFiles([])}
                                className="text-sm text-gray-500 hover:text-white transition-colors"
                            >
                                Clear all
                            </button>

                            <div className="flex gap-3">
                                {hasSuccess && (
                                    <button
                                        onClick={() => navigate(`/workspace/${slug}/documents`)}
                                        className="px-5 py-2.5 rounded-xl border border-white/20 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                                    >
                                        View Documents
                                    </button>
                                )}

                                {hasPending && (
                                    <button
                                        onClick={uploadAll}
                                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-semibold text-white hover:opacity-90 transition-opacity flex items-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Upload {files.filter((f) => f.status === 'pending').length} file(s)
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DocumentUpload;