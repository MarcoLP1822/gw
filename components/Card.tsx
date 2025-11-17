import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    noBorder?: boolean;
    noShadow?: boolean;
}

export default function Card({
    children,
    className = '',
    padding = 'md',
    noBorder = false,
    noShadow = false
}: CardProps) {
    const paddingClasses = {
        none: '',
        sm: 'p-2',
        md: 'p-3',
        lg: 'p-4'
    };

    return (
        <div
            className={clsx(
                'bg-white dark:bg-gray-800 rounded-lg',
                !noBorder && 'border border-gray-200 dark:border-gray-700',
                !noShadow && 'shadow-sm dark:shadow-gray-900/30',
                !noShadow && 'shadow-sm',
                paddingClasses[padding],
                className
            )}
        >
            {children}
        </div>
    );
}
