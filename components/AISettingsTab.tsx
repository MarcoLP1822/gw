'use client';

import { useState, useEffect } from 'react';
import { Settings, Sliders, Save, RotateCcw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { FormFieldTooltip, tooltipContent } from '@/components/ui/Tooltip';
import type { ProjectAIConfig } from '@prisma/client';

interface AISettingsTabProps {
    projectId: string;
    onRefresh?: () => void;
}

export default function AISettingsTab({ projectId, onRefresh }: AISettingsTabProps) {
    const [config, setConfig] = useState<Partial<ProjectAIConfig> | null>(null);
    const [originalConfig, setOriginalConfig] = useState<Partial<ProjectAIConfig> | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        loadConfig();
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

    const handleReset = async () => {
        if (!confirm('Reset alle impostazioni di default?')) return;
        try {
            setSaving(true);
            setError(null);
            const response = await fetch(`/api/projects/${projectId}/ai-config`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to reset');
            const resetConfig = await response.json();
            setConfig(resetConfig);
            setOriginalConfig(resetConfig);
            setSuccessMessage('Reset completato');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset');
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

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Sliders className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Parametri Tecnici</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
                        <select value={config.model || 'gpt-5-mini'} onChange={(e) => updateConfig('model', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                            <option value="gpt-5-mini">GPT-5 Mini</option>
                            <option value="gpt-4o">GPT-4o</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        </select>
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
                            <span className="ml-2 text-gray-500 font-normal">({config.topP})</span>
                        </label>
                        <input type="range" min="0" max="1" step="0.05" value={config.topP || 0.95} onChange={(e) => updateConfig('topP', parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Frequency Penalty
                            <FormFieldTooltip content={tooltipContent.frequencyPenalty} />
                            <span className="ml-2 text-gray-500 font-normal">({config.frequencyPenalty})</span>
                        </label>
                        <input type="range" min="0" max="2" step="0.1" value={config.frequencyPenalty || 0.3} onChange={(e) => updateConfig('frequencyPenalty', parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Presence Penalty
                            <FormFieldTooltip content={tooltipContent.presencePenalty} />
                            <span className="ml-2 text-gray-500 font-normal">({config.presencePenalty})</span>
                        </label>
                        <input type="range" min="0" max="2" step="0.1" value={config.presencePenalty || 0.3} onChange={(e) => updateConfig('presencePenalty', parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <button onClick={handleReset} disabled={saving} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"><RotateCcw className="w-4 h-4 inline mr-2" />Reset</button>
                    <div className="flex items-center gap-3">
                        {hasChanges && <span className="text-sm text-orange-600 font-medium">⚠️ Non salvato</span>}
                        <button onClick={handleSave} disabled={saving || !hasChanges} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Salvataggio...</span></> : <><Save className="w-4 h-4" /><span>Salva</span></>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}