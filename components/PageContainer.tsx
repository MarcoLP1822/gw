import { ReactNode } from 'react';
import { Menu } from 'lucide-react';

interface PageContainerProps {
    children: ReactNode;
    title?: string;
    description?: string;
    className?: string;
    onMenuClick?: () => void;
}

export default function PageContainer({
    children,
    title,
    description,
    className = '',
    onMenuClick
}: PageContainerProps) {
    return (
        <div className={`flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-auto ${className}`}>
            {/* Content with padding */}
            <div className="p-4 sm:p-6">
                {/* Header section (optional) */}
                {(title || description || onMenuClick) && (
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            {/* Mobile menu button */}
                            {onMenuClick && (
                                <button
                                    onClick={onMenuClick}
                                    className="lg:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    aria-label="Open menu"
                                >
                                    <Menu size={24} className="text-gray-700 dark:text-gray-300" />
                                </button>
                            )}
                            {title && (
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {title}
                                </h1>
                            )}
                        </div>
                        {description && (
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{description}</p>
                        )}
                    </div>
                )}

                {/* Main content */}
                {children}
            </div>
        </div>
    );
}
