import { ReactNode } from 'react';

interface PageContainerProps {
    children: ReactNode;
    title?: string;
    description?: string;
    className?: string;
}

export default function PageContainer({
    children,
    title,
    description,
    className = ''
}: PageContainerProps) {
    return (
        <div className={`flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-auto ${className}`}>
            {/* Content with padding */}
            <div className="p-6">
                {/* Header section (optional) */}
                {(title || description) && (
                    <div className="mb-6">
                        {title && (
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                {title}
                            </h1>
                        )}
                        {description && (
                            <p className="text-gray-600 dark:text-gray-400">{description}</p>
                        )}
                    </div>
                )}

                {/* Main content */}
                {children}
            </div>
        </div>
    );
}
