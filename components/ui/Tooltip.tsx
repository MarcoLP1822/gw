/**
 * Tooltip Component
 * 
 * Accessible, styled wrapper around Radix UI Tooltip.
 * Provides consistent tooltips across the application with keyboard navigation support.
 * 
 * Features:
 * - WCAG 2.1 AA compliant
 * - Keyboard accessible (hover + focus)
 * - Customizable positioning
 * - Auto-positioning to stay in viewport
 * - Delay before showing (300ms default)
 * 
 * @example
 * ```tsx
 * <Tooltip content="This is a helpful explanation">
 *   <button>Hover me</button>
 * </Tooltip>
 * 
 * <Tooltip 
 *   content="Advanced setting for experts" 
 *   side="right"
 *   delayDuration={500}
 * >
 *   <InfoIcon />
 * </Tooltip>
 * ```
 */

'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { ReactNode } from 'react';

interface TooltipProps {
    children: ReactNode;
    content: ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    delayDuration?: number;
    sideOffset?: number;
}

export function TooltipProvider({ children }: { children: ReactNode }) {
    return (
        <TooltipPrimitive.Provider delayDuration={300}>
            {children}
        </TooltipPrimitive.Provider>
    );
}

export function Tooltip({
    children,
    content,
    side = 'top',
    align = 'center',
    delayDuration = 300,
    sideOffset = 4,
}: TooltipProps) {
    return (
        <TooltipPrimitive.Root delayDuration={delayDuration}>
            <TooltipPrimitive.Trigger asChild>
                {children}
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                    side={side}
                    align={align}
                    sideOffset={sideOffset}
                    className="z-50 max-w-xs overflow-hidden rounded-md bg-slate-900 px-3 py-2 text-sm text-white shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                >
                    {content}
                    <TooltipPrimitive.Arrow className="fill-slate-900" width={11} height={5} />
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
    );
}

/**
 * Tooltip for form field help
 * Includes question mark icon by default
 */
export function FormFieldTooltip({
    content,
    side = 'right',
}: {
    content: ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
}) {
    return (
        <Tooltip content={content} side={side}>
            <button
                type="button"
                className="inline-flex items-center justify-center w-4 h-4 ml-1 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={(e) => e.preventDefault()}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                >
                    <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
        </Tooltip>
    );
}

/**
 * Tooltip presets for common scenarios
 */
export const tooltipContent = {
    // AI Settings
    temperature: (
        <div className="space-y-1">
            <p className="font-semibold">Temperature (0-2)</p>
            <p>Controlla la creatività dell&apos;AI:</p>
            <ul className="text-xs space-y-0.5 mt-1">
                <li>• 0-0.3: Molto prevedibile</li>
                <li>• 0.7-1.0: Bilanciato (consigliato)</li>
                <li>• 1.5-2.0: Molto creativo</li>
            </ul>
        </div>
    ),

    maxTokens: (
        <div className="space-y-1">
            <p className="font-semibold">Max Tokens</p>
            <p>Lunghezza massima della risposta.</p>
            <p className="text-xs mt-1">~4 caratteri = 1 token</p>
        </div>
    ),

    topP: (
        <div className="space-y-1">
            <p className="font-semibold">Top P (0-1)</p>
            <p>Controlla la diversità del vocabolario:</p>
            <ul className="text-xs space-y-0.5 mt-1">
                <li>• 0.9: Bilanciato (consigliato)</li>
                <li>• 1.0: Massima diversità</li>
            </ul>
        </div>
    ),

    frequencyPenalty: (
        <div className="space-y-1">
            <p className="font-semibold">Frequency Penalty (-2 a 2)</p>
            <p>Penalizza la ripetizione di parole:</p>
            <ul className="text-xs space-y-0.5 mt-1">
                <li>• 0: Nessuna penalità</li>
                <li>• 0.5-1.0: Riduce ripetizioni</li>
            </ul>
        </div>
    ),

    presencePenalty: (
        <div className="space-y-1">
            <p className="font-semibold">Presence Penalty (-2 a 2)</p>
            <p>Incoraggia nuovi argomenti:</p>
            <ul className="text-xs space-y-0.5 mt-1">
                <li>• 0: Nessuna penalità</li>
                <li>• 0.5-1.0: Più varietà tematica</li>
            </ul>
        </div>
    ),

    // Project Form
    currentSituation: (
        <div className="space-y-1">
            <p className="font-semibold">Situazione di Partenza</p>
            <p>Descrivi il contesto iniziale prima del cambiamento.</p>
            <p className="text-xs mt-1 italic">
                Es: &ldquo;La nostra startup aveva 5 dipendenti e fatturato zero&rdquo;
            </p>
        </div>
    ),

    challengeFaced: (
        <div className="space-y-1">
            <p className="font-semibold">Sfida Affrontata</p>
            <p>Qual è stato l&apos;ostacolo principale da superare?</p>
            <p className="text-xs mt-1 italic">
                Es: &ldquo;Trovare product-market fit in un mercato saturo&rdquo;
            </p>
        </div>
    ),

    transformation: (
        <div className="space-y-1">
            <p className="font-semibold">Trasformazione</p>
            <p>Come hai affrontato la sfida? Quali decisioni critiche?</p>
            <p className="text-xs mt-1 italic">
                Es: &ldquo;Abbiamo pivotato da B2C a B2B dopo 6 mesi di test&rdquo;
            </p>
        </div>
    ),

    achievement: (
        <div className="space-y-1">
            <p className="font-semibold">Risultati Ottenuti</p>
            <p>Quali risultati concreti e misurabili hai raggiunto?</p>
            <p className="text-xs mt-1 italic">
                Es: &ldquo;Crescita da 0 a 1M€ ARR in 18 mesi, 50 clienti enterprise&rdquo;
            </p>
        </div>
    ),

    lessonLearned: (
        <div className="space-y-1">
            <p className="font-semibold">Lezione Appresa</p>
            <p>Qual è l&apos;insight principale che vuoi trasmettere?</p>
            <p className="text-xs mt-1 italic">
                Es: &ldquo;Il timing è più importante della perfezione del prodotto&rdquo;
            </p>
        </div>
    ),

    uniqueValue: (
        <div className="space-y-1">
            <p className="font-semibold">Valore Unico</p>
            <p>Cosa rende la tua storia diversa dalle altre?</p>
            <p className="text-xs mt-1 italic">
                Es: &ldquo;Approccio contrarian al fundraising: bootstrap fino alla serie A&rdquo;
            </p>
        </div>
    ),

    // Actions
    deleteProject: (
        <div className="space-y-1">
            <p className="font-semibold text-red-400">⚠️ Attenzione</p>
            <p>Questa azione eliminerà definitivamente il progetto e tutti i capitoli generati.</p>
        </div>
    ),

    regenerateChapter: (
        <div className="space-y-1">
            <p className="font-semibold">Rigenera Capitolo</p>
            <p>Il contenuto attuale verrà sostituito con una nuova versione generata dall&apos;AI.</p>
        </div>
    ),
};
