'use client';

import { useState } from 'react';
import {
    CheckCircle2,
    Circle,
    Clock,
    User,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import clsx from 'clsx';
import type { WorkflowStage } from '@/types';

// Mock workflow stages
const mockWorkflowStages: WorkflowStage[] = [
    {
        id: '1',
        name: 'Ricerca e Scaletta',
        status: 'completed',
        assignee: 'Mario Rossi',
    },
    {
        id: '2',
        name: 'Prima Bozza',
        status: 'in-progress',
        dueDate: '2024-11-25',
        assignee: 'Mario Rossi',
    },
    {
        id: '3',
        name: 'Revisione Cliente',
        status: 'pending',
        dueDate: '2024-11-30',
        assignee: 'Maria Bianchi',
    },
    {
        id: '4',
        name: 'Correzioni',
        status: 'pending',
        assignee: 'Mario Rossi',
    },
    {
        id: '5',
        name: 'Approvazione Finale',
        status: 'pending',
        dueDate: '2024-12-05',
        assignee: 'Cliente',
    },
    {
        id: '6',
        name: 'Consegna',
        status: 'pending',
        dueDate: '2024-12-10',
    },
];

export default function WorkflowPanel() {
    const [collapsed, setCollapsed] = useState(false);
    const [stages] = useState<WorkflowStage[]>(mockWorkflowStages);

    const getStatusIcon = (status: WorkflowStage['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 size={20} className="text-green-600" />;
            case 'in-progress':
                return <Clock size={20} className="text-blue-600" />;
            default:
                return <Circle size={20} className="text-gray-400" />;
        }
    };

    const getStatusColor = (status: WorkflowStage['status']) => {
        switch (status) {
            case 'completed':
                return 'border-green-600 bg-green-50';
            case 'in-progress':
                return 'border-blue-600 bg-blue-50';
            default:
                return 'border-gray-300 bg-white';
        }
    };

    if (collapsed) {
        return (
            <div className="w-12 bg-gray-100 border-l border-gray-200 flex flex-col items-center py-4">
                <button
                    onClick={() => setCollapsed(false)}
                    className="p-2 hover:bg-gray-200 rounded-lg"
                    title="Espandi pannello flusso di lavoro"
                >
                    <ChevronUp size={20} />
                </button>
            </div>
        );
    }

    return (
        <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Flusso di Lavoro</h3>
                    <button
                        onClick={() => setCollapsed(true)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Riduci pannello"
                    >
                        <ChevronDown size={18} />
                    </button>
                </div>
                <p className="text-sm text-gray-600">Traccia il progresso del tuo progetto</p>
            </div>

            {/* Progress Overview */}
            <div className="p-4 bg-white border-b border-gray-200">
                <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progresso Complessivo</span>
                    <span className="font-semibold text-gray-900">17%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '17%' }} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                        <div className="text-green-600 font-semibold">1</div>
                        <div className="text-gray-500">Completate</div>
                    </div>
                    <div className="text-center">
                        <div className="text-blue-600 font-semibold">1</div>
                        <div className="text-gray-500">Attive</div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-400 font-semibold">4</div>
                        <div className="text-gray-500">In Attesa</div>
                    </div>
                </div>
            </div>

            {/* Workflow Stages */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                    {stages.map((stage, index) => (
                        <div
                            key={stage.id}
                            className={clsx(
                                'p-3 rounded-lg border-2 transition-all',
                                getStatusColor(stage.status)
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    {getStatusIcon(stage.status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <h4 className="font-medium text-gray-900 text-sm">
                                            {index + 1}. {stage.name}
                                        </h4>
                                    </div>

                                    {stage.assignee && (
                                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                                            <User size={14} />
                                            <span>{stage.assignee}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
