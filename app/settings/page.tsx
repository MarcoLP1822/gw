'use client';

import { useState } from 'react';
import clsx from 'clsx';
import Sidebar from '@/components/Sidebar';
import PageContainer from '@/components/PageContainer';
import Card from '@/components/Card';
import { User, Bell, Shield, Globe, Save } from 'lucide-react';

export default function ImpostazioniPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Mock state per le impostazioni
    const [settings, setSettings] = useState({
        // Profilo
        name: 'Marco LP',
        email: 'marco.lp@example.com',
        phone: '+39 123 456 7890',

        // Notifiche
        emailNotifications: true,
        pushNotifications: false,
        projectUpdates: true,

        // Privacy
        profileVisible: true,
        showEmail: false,

        // Preferenze
        language: 'it',
    });

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar Navigation */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggleAction={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileOpen={mobileMenuOpen}
                onMobileClose={() => setMobileMenuOpen(false)}
            />

            {/* Settings Content */}
            <div className={clsx(
                "flex-1 overflow-auto transition-all duration-300",
                sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
            )}>
                <PageContainer
                    title="Impostazioni"
                    description="Gestisci le tue preferenze e configurazioni"
                    onMenuClick={() => setMobileMenuOpen(true)}
                >
                    {/* Profile Section */}
                    <Card className="mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <User className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Profilo</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Gestisci le tue informazioni personali</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    value={settings.name}
                                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={settings.email}
                                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Telefono
                                </label>
                                <input
                                    type="tel"
                                    value={settings.phone}
                                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Notifications Section */}
                    <Card className="mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Bell className="text-green-600 dark:text-green-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Notifiche</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Configura come ricevere gli aggiornamenti</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Notifiche Email</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Ricevi aggiornamenti via email</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.emailNotifications}
                                        onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Notifiche Push</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Ricevi notifiche sul dispositivo</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.pushNotifications}
                                        onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Aggiornamenti Progetti</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Notifiche sui cambiamenti di stato</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.projectUpdates}
                                        onChange={(e) => setSettings({ ...settings, projectUpdates: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </Card>

                    {/* Privacy Section */}
                    <Card className="mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Shield className="text-purple-600 dark:text-purple-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Privacy</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Controlla la visibilità del tuo profilo</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Profilo Visibile</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Rendi il tuo profilo visibile ad altri</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.profileVisible}
                                        onChange={(e) => setSettings({ ...settings, profileVisible: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Mostra Email</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Rendi la tua email visibile</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.showEmail}
                                        onChange={(e) => setSettings({ ...settings, showEmail: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </Card>

                    {/* Preferences Section */}
                    <Card className="mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Globe className="text-orange-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Preferenze</h2>
                                <p className="text-sm text-gray-600">Personalizza le tue preferenze</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Globe size={16} />
                                        <span>Lingua</span>
                                    </div>
                                </label>
                                <select
                                    value={settings.language}
                                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="it">Italiano</option>
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium">
                            <Save size={20} />
                            Salva Modifiche
                        </button>
                    </div>
                </PageContainer>
            </div>
        </div>
    );
}
