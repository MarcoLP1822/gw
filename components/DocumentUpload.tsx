/**
 * Document Upload Component
 * 
 * Allows users to upload reference documents (PDF, DOCX, TXT)
 * for style guide generation and content enrichment
 */

'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import type { PutBlobResult } from '@vercel/blob';

interface Document {
    id: string;
    originalFileName: string;
    fileType: string;
    fileSizeBytes: number;
    wordCount: number;
    uploadedAt: string;
    purpose: string;
}

interface DocumentUploadProps {
    projectId: string;
    documents: Document[];
    onUploadSuccessAction: () => void;
    onDeleteSuccessAction: () => void;
}

export default function DocumentUpload({
    projectId,
    documents,
    onUploadSuccessAction,
    onDeleteSuccessAction,
}: DocumentUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        const validExtensions = ['pdf', 'docx', 'txt'];
        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || '')) {
            setError('Tipo di file non supportato. Usa PDF, DOCX o TXT');
            return;
        }

        // Validate file size (50MB)
        if (file.size > 50 * 1024 * 1024) {
            setError('File troppo grande. Massimo 50MB');
            return;
        }

        await uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        try {
            setUploading(true);
            setError(null);
            setUploadProgress(`Caricamento ${file.name}...`);

            // Step 1: Upload directly to Vercel Blob (bypasses 4.5MB limit)
            const blob: PutBlobResult = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: `/api/projects/${projectId}/documents/upload`,
                clientPayload: JSON.stringify({
                    purpose: 'style_reference',
                    fileName: file.name,
                }),
            });

            console.log('File uploaded to Vercel Blob:', blob.url);

            setUploadProgress('Elaborazione documento...');

            // Step 2: Process the uploaded file (extract text, save to DB)
            const processResponse = await fetch(`/api/projects/${projectId}/documents/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    blobUrl: blob.url,
                    fileName: file.name,
                    purpose: 'style_reference',
                }),
            });

            const processData = await processResponse.json();

            if (!processData.success) {
                throw new Error(processData.error || 'Errore durante l\'elaborazione del documento');
            }

            setUploadProgress('Caricamento completato!');
            setTimeout(() => setUploadProgress(null), 2000);

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            onUploadSuccessAction();
        } catch (err) {
            console.error('Upload error:', err);
            setError(err instanceof Error ? err.message : 'Errore durante il caricamento');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (documentId: string) => {
        if (!confirm('Eliminare questo documento?')) return;

        try {
            setDeletingId(documentId);
            setError(null);

            const response = await fetch(`/api/projects/${projectId}/documents/${documentId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Errore durante l\'eliminazione');
            }

            onDeleteSuccessAction();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione');
        } finally {
            setDeletingId(null);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-4">
            {/* Upload Button */}
            <div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || documents.length >= 5}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Caricamento...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4" />
                            <span>Carica Documento</span>
                        </>
                    )}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                    Formati supportati: PDF, DOCX, TXT • Max 50MB • Max {5 - documents.length} documenti rimanenti
                </p>
            </div>

            {/* Upload Progress */}
            {uploadProgress && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-800">{uploadProgress}</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Document List */}
            {documents.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Documenti Caricati</h4>
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <FileText className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {doc.originalFileName}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {formatFileSize(doc.fileSizeBytes)} • {doc.wordCount.toLocaleString()} parole • {formatDate(doc.uploadedAt)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(doc.id)}
                                disabled={deletingId === doc.id}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors flex-shrink-0"
                                title="Elimina documento"
                            >
                                {deletingId === doc.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <X className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {documents.length === 0 && !uploading && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">Nessun documento caricato</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Carica documenti di riferimento per generare lo style guide
                    </p>
                </div>
            )}
        </div>
    );
}
