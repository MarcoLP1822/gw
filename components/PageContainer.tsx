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
                {/* Mobile menu button only */}
                {onMenuClick && (
                    <div className="lg:hidden mb-4">
                        <button
                            onClick={onMenuClick}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            aria-label="Open menu"
                        >
                            <Menu size={24} className="text-gray-700 dark:text-gray-300" />
                        </button>
                    </div>
                )}

                {/* Main content */}
                {children}
            </div>
        </div>
    );
}
