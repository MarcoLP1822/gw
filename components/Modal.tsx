'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    preventClose?: boolean; // Se true, impedisce chiusura con click fuori o ESC
}

export default function Modal({ isOpen, onCloseAction, title, children, size = 'lg', preventClose = false }: ModalProps) {
    // Chiudi il modal con ESC
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !preventClose) onCloseAction();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Previeni scroll del body
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onCloseAction, preventClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-6xl',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={preventClose ? undefined : onCloseAction}
            />

            {/* Modal Container */}
            <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
                <div
                    className={`relative w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl transform transition-all max-h-[95vh] flex flex-col`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate pr-2">{title}</h2>
                        {!preventClose && (
                            <button
                                onClick={onCloseAction}
                                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                            >
                                <X size={24} />
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
