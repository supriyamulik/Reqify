import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Search,
    Trash2,
    Eye,
    ChevronRight,
    Upload,
    Loader2,
    AlertCircle,
    FileCode,
    Filter
} from 'lucide-react';
import axios from 'axios';

const DocumentList = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState(null); // docId being confirmed

    // ─── Fetch documents ──────────────────────────
    const fetchDocuments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;

            const res = await axios.get('/api/documents', { params });
            setDocuments(res.data.documents);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load documents');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // ─── Delete ───────────────────────────────────
    const handleDelete = async (docId) => {
        try {
            await axios.delete(`/api/documents/${docId}`);
            setDocuments((prev) => prev.filter((d) => d._id !== docId));
            setDeleteConfirm(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
            setDeleteConfirm(null);
        }
    };

    // ─── Filtering ────────────────────────────────
    const filtered = documents.filter((doc) =>
        doc.originalName.toLowerCase().includes(search.toLowerCase())
    );

    // ─── Helpers ──────────────────────────────────
    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const statusBadge = (status) => {
        const map = {
            uploaded: { bg: 'bg-blue-500/20 border-blue-500/30', text: 'text-blue-400', label: 'Uploaded' },
            extracting: { bg: 'bg-yellow-500/20 border-yellow-500/30', text: 'text-yellow-400', label: 'Extracting' },
            analyzing: { bg: 'bg-purple-500/20 border-purple-500/30', text: 'text-purple-400', label: 'Analyzing' },
            analyzed: { bg: 'bg-emerald-500/20 border-emerald-500/30', text: 'text-emerald-400', label: 'Analyzed' },
            error: { bg: 'bg-red-500/20 border-red-500/30', text: 'text-red-400', label: 'Error' }
        };
        const s = map[status] || map.uploaded;
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium ${s.bg} ${s.text}`}>
                {s.label}
            </span>
        );
    };

    const fileIcon = (type) => {
        const cls = 'w-5 h-5';
        switch (type) {
            case 'pdf': return <FileText className={`${cls} text-red-400`} />;
            case 'docx': return <FileCode className={`${cls} text-blue-400`} />;
            case 'txt': return <FileText className={`${cls} text-gray-400`} />;
            default: return <FileText className={`${cls} text-gray-400`} />;
        }
    };

    // ─── Loading skeleton ─────────────────────────
    if (loading) {
        return (
            <div className="min-h-full p-6 lg:p-10">
                <div className="max-w-5xl mx-auto space-y-4">
                    <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse" />
                    <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    // ─── Main render ──────────────────────────────
    return (
        <div className="min-h-full p-6 lg:p-10">
            <div className="max-w-5xl mx-auto">

                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Documents</h1>
                        <p className="text-gray-400 text-sm mt-0.5">
                            {documents.length} document{documents.length !== 1 ? 's' : ''} in this workspace
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(`/workspace/${slug}/upload`)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    >
                        <Upload className="w-4 h-4" />
                        Upload
                    </button>
                </div>

                {/* Search + filter bar */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row gap-3 mb-6"
                >
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 focus:outline-none text-sm transition-colors"
                        />
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-indigo-500/50 focus:outline-none cursor-pointer"
                        >
                            <option value="all" className="bg-gray-900">All statuses</option>
                            <option value="uploaded" className="bg-gray-900">Uploaded</option>
                            <option value="extracting" className="bg-gray-900">Extracting</option>
                            <option value="analyzing" className="bg-gray-900">Analyzing</option>
                            <option value="analyzed" className="bg-gray-900">Analyzed</option>
                            <option value="error" className="bg-gray-900">Error</option>
                        </select>
                    </div>
                </motion.div>

                {/* Error banner */}
                {error && (
                    <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Table / List */}
                {filtered.length === 0 ? (
                    /* Empty state */
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-24 rounded-2xl border border-white/10 bg-white/5"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-white font-medium">
                            {search ? 'No documents match your search' : 'No documents yet'}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                            {search ? 'Try a different search term' : 'Upload your first SRS document to get started'}
                        </p>
                        {!search && (
                            <button
                                onClick={() => navigate(`/workspace/${slug}/upload`)}
                                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-sm text-white hover:bg-white/10 transition-colors"
                            >
                                <Upload className="w-4 h-4" />
                                Upload Document
                            </button>
                        )}
                    </motion.div>
                ) : (
                    /* Document rows */
                    <div className="space-y-2">
                        {filtered.map((doc, i) => (
                            <motion.div
                                key={doc._id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="group relative rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors"
                            >
                                {/* Delete confirmation overlay */}
                                <AnimatePresence>
                                    {deleteConfirm === doc._id && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-gray-900/90 backdrop-blur-sm"
                                        >
                                            <div className="text-center px-4">
                                                <p className="text-sm text-white font-medium mb-3">
                                                    Delete "{doc.originalName}"?
                                                </p>
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="px-4 py-1.5 rounded-lg border border-white/20 text-xs text-white hover:bg-white/10 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(doc._id)}
                                                        className="px-4 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/30 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Row content */}
                                <div className="flex items-center gap-4 p-4">
                                    {/* File type icon */}
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                        {fileIcon(doc.fileType)}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <p className="text-sm font-medium text-white truncate">{doc.originalName}</p>
                                            {statusBadge(doc.status)}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-gray-500">{formatSize(doc.fileSize)}</span>
                                            <span className="text-gray-700">·</span>
                                            <span className="text-xs text-gray-500">
                                                {doc.uploadedBy?.name || 'Unknown'}
                                            </span>
                                            <span className="text-gray-700">·</span>
                                            <span className="text-xs text-gray-500">{formatDate(doc.uploadedAt)}</span>
                                        </div>
                                    </div>

                                    {/* Stats (only if analyzed) */}
                                    {doc.status === 'analyzed' && (
                                        <div className="hidden md:flex items-center gap-4">
                                            <span className="text-xs text-gray-500">
                                                <span className="text-white font-medium">{doc.requirementCount}</span> reqs
                                            </span>
                                            {doc.duplicateCount > 0 && (
                                                <span className="text-xs text-yellow-400">
                                                    <span className="font-medium">{doc.duplicateCount}</span> dups
                                                </span>
                                            )}
                                            {doc.conflictCount > 0 && (
                                                <span className="text-xs text-red-400">
                                                    <span className="font-medium">{doc.conflictCount}</span> conflicts
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* View details */}
                                        <Link
                                            to={`/workspace/${slug}/documents/${doc._id}`}
                                            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        {/* Arrow → details page */}
                                        <Link
                                            to={`/workspace/${slug}/documents/${doc._id}`}
                                            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-indigo-400 transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                        {/* Delete */}
                                        <button
                                            onClick={() => setDeleteConfirm(doc._id)}
                                            className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentList;