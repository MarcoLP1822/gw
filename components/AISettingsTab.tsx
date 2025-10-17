'use client';

import { useState, useEffect } from 'react';
import { Settings, Sliders, Save, RotateCcw, AlertCircle, CheckCircle2, Loader2, Sparkles, FileText, Trash2, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { FormFieldTooltip, tooltipContent } from '@/components/ui/Tooltip';
import DocumentUpload from '@/components/DocumentUpload';
import StyleGuideEditor from '@/components/StyleGuideEditor';
import type { ProjectAIConfig } from '@prisma/client';

interface Document {
    id: string;
    originalFileName: string;
    fileType: string;
    fileSizeBytes: number;
    wordCount: number;
    uploadedAt: string;
    purpose: string;
}

interface AISettingsTabProps {
    projectId: string;
    onRefresh?: () => void;
}

export default function AISettingsTab({ projectId, onRefresh }: AISettingsTabProps) {
    const [config, setConfig] = useState<Partial<ProjectAIConfig> | null>(null);
    const [originalConfig, setOriginalConfig] = useState<Partial<ProjectAIConfig> | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    useEffect(() => {
        loadConfig();
        loadDocuments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const loadConfig = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/projects/${projectId}/ai-config`);
            if (!response.ok) throw new Error('Failed to load AI configuration');
            const data = await response.json();
            setConfig(data);
            setOriginalConfig(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load configuration');
        } finally {
            setLoading(false);
        }
    };

    const loadDocuments = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/documents`);
            if (!response.ok) throw new Error('Failed to load documents');
            const data = await response.json();
            if (data.success) {
                setDocuments(data.documents);
            }
        } catch (err) {
            console.error('Error loading documents:', err);
        }
    };

    const handleSave = async () => {
        if (!config) return;
        try {
            setSaving(true);
            setError(null);
            setSuccessMessage(null);
            const response = await fetch(`/api/projects/${projectId}/ai-config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save configuration');
            }
            const savedConfig = await response.json();
            setConfig(savedConfig);
            setOriginalConfig(savedConfig);
            setSuccessMessage('Configurazione salvata!');
            setTimeout(() => setSuccessMessage(null), 3000);
            if (onRefresh) onRefresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleResetSettings = async () => {
        if (!confirm('Vuoi resettare le impostazioni AI ai valori di default?')) return;
        try {
            setSaving(true);
            setError(null);
            const response = await fetch(`/api/projects/${projectId}/ai-config`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to reset settings');
            const resetConfig = await response.json();
            setConfig(resetConfig);
            setOriginalConfig(resetConfig);
            setSuccessMessage('Impostazioni resettate ai valori di default');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset settings');
        } finally {
            setSaving(false);
        }
    };

    const handleResetProject = async () => {
        const confirmMessage = 'ATTENZIONE: Questa azione cancellerà TUTTO il contenuto generato (outline, capitoli, consistency reports) e riporterà il progetto allo stato iniziale di bozza.\n\nQuesta azione NON può essere annullata.\n\nSei sicuro di voler continuare?';
        if (!confirm(confirmMessage)) return;

        // Doppia conferma per sicurezza
        if (!confirm('Confermi nuovamente? Tutto il lavoro generato verrà perso.')) return;

        try {
            setSaving(true);
            setError(null);
            const response = await fetch(`/api/projects/${projectId}/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to reset project');
            }

            setSuccessMessage('Progetto resettato con successo! Reindirizzamento...');

            // Ricarica la pagina dopo 2 secondi per mostrare lo stato aggiornato
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset project');
        } finally {
            setSaving(false);
        }
    };

    const updateConfig = (field: keyof ProjectAIConfig, value: any) => {
        setConfig(prev => prev ? { ...prev, [field]: value } : null);
    };

    const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);

    if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    if (!config) return <div className="text-center py-12"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" /><p className="text-gray-600">Errore caricamento</p></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Messaggi di errore/successo */}
            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"><AlertCircle className="w-5 h-5 text-red-600" /><p className="text-sm text-red-800">{error}</p></div>}
            {successMessage && <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-green-600" /><p className="text-sm text-green-800">{successMessage}</p></div>}

            {/* Parametri Tecnici - Collapsible */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('technical')}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Sliders className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Parametri Tecnici</h3>
                    </div>
                    {expandedSections.includes('technical') ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                </button>

                {expandedSections.includes('technical') && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    AI Model
                                    <FormFieldTooltip content="Seleziona il modello AI da utilizzare per la generazione dei contenuti. GPT-5 è il più potente, GPT-5 mini è più veloce ed economico, GPT-5 nano è il più veloce." />
                                </label>
                                <select
                                    value={config.model || 'gpt-5-mini'}
                                    onChange={(e) => updateConfig('model', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                                >
                                    <option value="gpt-5">GPT-5 - Il migliore per coding e task complessi (più costoso)</option>
                                    <option value="gpt-5-mini">GPT-5 mini - Veloce ed economico per task ben definiti (consigliato)</option>
                                    <option value="gpt-5-nano">GPT-5 nano - Il più veloce ed economico</option>
                                </select>
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-xs text-gray-700">
                                            {config.model === 'gpt-5' && (
                                                <>
                                                    <p className="font-semibold mb-1">GPT-5 - Modello Premium</p>
                                                    <p>Il migliore per coding, task agentic e contenuti complessi. Massima qualità ma costo più elevato.</p>
                                                </>
                                            )}
                                            {config.model === 'gpt-5-mini' && (
                                                <>
                                                    <p className="font-semibold mb-1">GPT-5 mini - Bilanciato (Consigliato)</p>
                                                    <p>Ottimo rapporto qualità/prezzo. Ideale per la generazione di libri con task ben definiti.</p>
                                                </>
                                            )}
                                            {config.model === 'gpt-5-nano' && (
                                                <>
                                                    <p className="font-semibold mb-1">GPT-5 nano - Economia</p>
                                                    <p>Massima velocità e minimo costo. Adatto per progetti semplici e budget limitati.</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Temperature
                                    <FormFieldTooltip content={tooltipContent.temperature} />
                                    <span className="ml-2 text-gray-500 font-normal">({config.temperature})</span>
                                </label>
                                <input type="range" min="0" max="1" step="0.1" value={config.temperature || 0.7} onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                <div className="flex justify-between text-xs text-gray-500 mt-1"><span>Preciso</span><span>Creativo</span></div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Tokens
                                    <FormFieldTooltip content={tooltipContent.maxTokens} />
                                </label>
                                <input type="number" min="1000" max="16000" step="500" value={config.maxTokens || 4000} onChange={(e) => updateConfig('maxTokens', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Words</label>
                                <input type="number" min="500" max="5000" step="100" value={config.targetWordsPerChapter || 2000} onChange={(e) => updateConfig('targetWordsPerChapter', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Top P
                                    <FormFieldTooltip content={tooltipContent.topP} />
                                    <span className="ml-2 text-gray-500 font-normal">({config.topP ?? 0.95})</span>
                                </label>
                                <input type="range" min="0" max="1" step="0.05" value={config.topP ?? 0.95} onChange={(e) => updateConfig('topP', parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Frequency Penalty
                                    <FormFieldTooltip content={tooltipContent.frequencyPenalty} />
                                    <span className="ml-2 text-gray-500 font-normal">({config.frequencyPenalty ?? 0.3})</span>
                                </label>
                                <input type="range" min="0" max="2" step="0.1" value={config.frequencyPenalty ?? 0.3} onChange={(e) => updateConfig('frequencyPenalty', parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Presence Penalty
                                    <FormFieldTooltip content={tooltipContent.presencePenalty} />
                                    <span className="ml-2 text-gray-500 font-normal">({config.presencePenalty ?? 0.3})</span>
                                </label>
                                <input type="range" min="0" max="2" step="0.1" value={config.presencePenalty ?? 0.3} onChange={(e) => updateConfig('presencePenalty', parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Document Upload Section - Collapsible */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('documents')}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Documenti di Riferimento</h3>
                    </div>
                    {expandedSections.includes('documents') ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                </button>

                {expandedSections.includes('documents') && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mb-4 mt-6">
                            Carica documenti di riferimento per generare automaticamente lo style guide
                        </p>
                        <DocumentUpload
                            projectId={projectId}
                            documents={documents}
                            onUploadSuccessAction={loadDocuments}
                            onDeleteSuccessAction={loadDocuments}
                        />
                    </div>
                )}
            </div>

            {/* Style Guide Section - Collapsible */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('styleguide')}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Style Guide</h3>
                    </div>
                    {expandedSections.includes('styleguide') ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                </button>

                {expandedSections.includes('styleguide') && (
                    <div className="px-6 pb-6 border-t border-gray-100 mt-6">
                        <StyleGuideEditor
                            projectId={projectId}
                            hasDocuments={documents.length > 0}
                            onGenerateSuccess={loadDocuments}
                        />
                    </div>
                )}
            </div>

            {/* Save/Reset Buttons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleResetSettings}
                            disabled={saving}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                        >
                            <RotateCcw className="w-4 h-4 inline mr-2" />
                            Resetta Impostazioni
                        </button>
                        <button
                            onClick={handleResetProject}
                            disabled={saving}
                            className="px-4 py-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-red-300"
                        >
                            <Trash2 className="w-4 h-4 inline mr-2" />
                            Reset Progetto Completo
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        {hasChanges && <span className="text-sm text-orange-600 font-medium">⚠️ Non salvato</span>}
                        <button onClick={handleSave} disabled={saving || !hasChanges} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Salvataggio...</span></> : <><Save className="w-4 h-4" /><span>Salva</span></>}
                        </button>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-800">
                        <strong>Attenzione:</strong> Il &quot;Reset Progetto Completo&quot; cancellerà permanentemente tutto il contenuto generato (outline, capitoli, consistency reports) e riporterà il progetto allo stato iniziale di bozza. Questa azione non può essere annullata.
                    </p>
                </div>
            </div>
        </div>
    );
}