/**
 * WorkflowStepper Component
 * 
 * Visual progress bar showing the user's position in the project workflow.
 * Helps reduce cognitive load by making the process transparent and predictable.
 * 
 * Workflow Steps:
 * 1. Info Progetto - Project details configured
 * 2. AI Settings - AI parameters configured
 * 3. Outline - Book structure generated
 * 4. Capitoli - Chapters being written (shows progress X/N)
 * 5. Consistency Check - Quality verification
 * 6. Export - Final document ready
 * 
 * @example
 * ```tsx
 * <WorkflowStepper
 *   currentStep="chapters"
 *   projectData={{
 *     hasAIConfig: true,
 *     hasOutline: true,
 *     chaptersCompleted: 3,
 *     totalChapters: 12,
 *     hasConsistencyCheck: false
 *   }}
 * />
 * ```
 */

'use client';

import { useState, useEffect } from 'react';
import { Check, Settings, FileText, BookOpen, CheckCircle, Download, ChevronUp, ChevronDown, type LucideIcon } from 'lucide-react';

type WorkflowStep = 'info' | 'ai-settings' | 'outline' | 'chapters' | 'consistency' | 'export';

interface WorkflowStepConfig {
    id: WorkflowStep;
    label: string;
    icon: LucideIcon;
    description: string;
}

interface WorkflowStepperProps {
    currentStep: WorkflowStep;
    projectData: {
        hasAIConfig: boolean;
        hasOutline: boolean;
        chaptersCompleted: number;
        totalChapters: number;
        hasConsistencyCheck: boolean;
    };
}

const steps: WorkflowStepConfig[] = [
    {
        id: 'info',
        label: 'Info Progetto',
        icon: BookOpen,
        description: 'Dettagli progetto e autore'
    },
    {
        id: 'ai-settings',
        label: 'AI Settings',
        icon: Settings,
        description: 'Configurazione AI'
    },
    {
        id: 'outline',
        label: 'Outline',
        icon: FileText,
        description: 'Struttura del libro'
    },
    {
        id: 'chapters',
        label: 'Capitoli',
        icon: BookOpen,
        description: 'Contenuto capitoli'
    },
    {
        id: 'consistency',
        label: 'Check',
        icon: CheckCircle,
        description: 'Verifica coerenza'
    },
    {
        id: 'export',
        label: 'Export',
        icon: Download,
        description: 'Esporta documento'
    }
];

export default function WorkflowStepper({ currentStep, projectData }: WorkflowStepperProps) {
    /**
     * Determine step status based on project data
     */
    const getStepStatus = (stepId: WorkflowStep): 'completed' | 'current' | 'upcoming' => {
        const stepIndex = steps.findIndex(s => s.id === stepId);
        const currentIndex = steps.findIndex(s => s.id === currentStep);

        // Info is always completed (project exists)
        if (stepId === 'info') return 'completed';

        // AI Settings completed if configured
        if (stepId === 'ai-settings') {
            return projectData.hasAIConfig ? 'completed' : stepIndex === currentIndex ? 'current' : 'upcoming';
        }

        // Outline completed if exists
        if (stepId === 'outline') {
            return projectData.hasOutline ? 'completed' : stepIndex === currentIndex ? 'current' : 'upcoming';
        }

        // Chapters completed if all done
        if (stepId === 'chapters') {
            const allChaptersComplete = projectData.totalChapters > 0 &&
                projectData.chaptersCompleted >= projectData.totalChapters;
            return allChaptersComplete ? 'completed' : stepIndex === currentIndex ? 'current' : 'upcoming';
        }

        // Consistency check completed if run
        if (stepId === 'consistency') {
            return projectData.hasConsistencyCheck ? 'completed' : stepIndex === currentIndex ? 'current' : 'upcoming';
        }

        // Export is available when all chapters are done
        if (stepId === 'export') {
            const canExport = projectData.totalChapters > 0 &&
                projectData.chaptersCompleted >= projectData.totalChapters;
            return canExport ? (stepIndex === currentIndex ? 'current' : 'completed') : 'upcoming';
        }

        return stepIndex === currentIndex ? 'current' : stepIndex < currentIndex ? 'completed' : 'upcoming';
    };

    // 🎯 State for collapse/expand with localStorage persistence
    const [isCollapsed, setIsCollapsed] = useState(() => {
        // Initialize from localStorage on client side
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('workflow-stepper-collapsed');
            return saved === 'true';
        }
        return false;
    });

    // Save preference to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('workflow-stepper-collapsed', String(isCollapsed));
        }
    }, [isCollapsed]);

    /**
     * Get progress label for chapters step
     */
    const getChaptersProgress = (): string => {
        if (projectData.totalChapters === 0) return 'Da iniziare';
        return `${projectData.chaptersCompleted}/${projectData.totalChapters}`;
    };

    return (
        <div className="bg-white border-b border-slate-200">
            {/* Toggle Button - sempre visibile */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full px-6 py-2 flex items-center justify-between text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                aria-label={isCollapsed ? "Espandi workflow" : "Comprimi workflow"}
            >
                <span className="font-medium">Workflow Progress</span>
                {isCollapsed ? (
                    <ChevronDown size={18} className="text-slate-400" />
                ) : (
                    <ChevronUp size={18} className="text-slate-400" />
                )}
            </button>

            {/* Stepper Content - collassabile */}
            {!isCollapsed && (
                <div className="px-6 pb-3 pt-1">
                    <div className="max-w-5xl mx-auto">
                        {/* Mobile: Vertical List */}
                        <div className="block md:hidden space-y-2">
                            {steps.map((step) => {
                                const status = getStepStatus(step.id);
                                const Icon = step.icon;

                                return (
                                    <div
                                        key={step.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${status === 'current'
                                            ? 'bg-blue-50 border-2 border-blue-500'
                                            : status === 'completed'
                                                ? 'bg-green-50 border border-green-200'
                                                : 'bg-slate-50 border border-slate-200'
                                            }`}
                                    >
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${status === 'completed'
                                            ? 'bg-green-500'
                                            : status === 'current'
                                                ? 'bg-blue-500'
                                                : 'bg-slate-300'
                                            }`}>
                                            {status === 'completed' ? (
                                                <Check size={16} className="text-white" />
                                            ) : (
                                                <Icon size={16} className="text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-medium truncate ${status === 'current' ? 'text-blue-900' : 'text-slate-700'
                                                }`}>
                                                {step.label}
                                                {step.id === 'chapters' && projectData.totalChapters > 0 && (
                                                    <span className="ml-2 text-xs">({getChaptersProgress()})</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Desktop: Horizontal Stepper */}
                        <div className="hidden md:flex items-center justify-between">
                            {steps.map((step, index) => {
                                const status = getStepStatus(step.id);
                                const Icon = step.icon;
                                const isLast = index === steps.length - 1;

                                return (
                                    <div key={step.id} className="flex items-center flex-1">
                                        {/* Step Circle */}
                                        <div className="flex flex-col items-center">
                                            {/* Icon Circle */}
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${status === 'completed'
                                                    ? 'bg-green-500 scale-100'
                                                    : status === 'current'
                                                        ? 'bg-blue-500 scale-110 ring-4 ring-blue-100'
                                                        : 'bg-slate-300 scale-100'
                                                    }`}
                                            >
                                                {status === 'completed' ? (
                                                    <Check size={20} className="text-white" />
                                                ) : (
                                                    <Icon
                                                        size={20}
                                                        className={status === 'current' ? 'text-white' : 'text-white'}
                                                    />
                                                )}
                                            </div>

                                            {/* Label */}
                                            <div className="mt-2 text-center">
                                                <div
                                                    className={`text-sm font-medium whitespace-nowrap ${status === 'current'
                                                        ? 'text-blue-600'
                                                        : status === 'completed'
                                                            ? 'text-green-600'
                                                            : 'text-slate-500'
                                                        }`}
                                                >
                                                    {step.label}
                                                </div>

                                                {/* Progress for chapters */}
                                                {step.id === 'chapters' && projectData.totalChapters > 0 && (
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {getChaptersProgress()}
                                                    </div>
                                                )}

                                                {/* Status indicator */}
                                                {status === 'current' && (
                                                    <div className="text-xs text-blue-500 mt-1 font-medium">
                                                        In corso
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Connector Line */}
                                        {!isLast && (
                                            <div className="flex-1 h-0.5 mx-4 mb-8">
                                                <div
                                                    className={`h-full transition-all duration-500 ${status === 'completed'
                                                        ? 'bg-green-500'
                                                        : 'bg-slate-300'
                                                        }`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
