'use client';

import React from 'react';

export default function SettingsPage() {

    const handleClearData = () => {
        if (confirm('DANGER: This will clear local browser cache of the app token and state. It will NOT delete server data (unless we add that API call). Proceed?')) {
            localStorage.clear();
            document.cookie = 'app_token=; path=/; max-age=0';
            window.location.reload();
        }
    };

    const handleExport = () => {
        // Mock export for now, or fetch full state from API
        alert('Export feature coming soon (requires backend dump).');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl mb-2">Settings</h1>
            <p className="text-slate-500 mb-8">Manage application data and preferences.</p>

            <div className="card mb-6">
                <h3 className="text-lg font-bold mb-4 text-slate-800">Data Management</h3>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                        <div>
                            <div className="font-semibold text-slate-700">Export Data</div>
                            <div className="text-sm text-slate-400">Download a JSON backup of all students and logs.</div>
                        </div>
                        <button onClick={handleExport} className="btn-secondary">Export JSON</button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50">
                        <div>
                            <div className="font-semibold text-slate-700">Import Data</div>
                            <div className="text-sm text-slate-400">Restore from a backup file.</div>
                        </div>
                        <button className="btn-secondary" disabled>Coming Soon</button>
                    </div>
                </div>
            </div>

            <div className="card border-red-100">
                <h3 className="text-lg font-bold mb-4 text-red-600">Danger Zone</h3>
                <div className="flex items-center justify-between p-4 border border-red-100 rounded-xl bg-red-50">
                    <div>
                        <div className="font-semibold text-red-700">Reset Application</div>
                        <div className="text-sm text-red-400">Clears local session and data cache.</div>
                    </div>
                    <button onClick={handleClearData} className="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-600 hover:text-white transition-colors">
                        Reset App
                    </button>
                </div>
            </div>
        </div>
    );
}
