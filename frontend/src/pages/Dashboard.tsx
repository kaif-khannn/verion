import React, { useState } from 'react';
import GenerateTab from '../components/dashboard/GenerateTab';
import IntegrationsTab from '../components/dashboard/IntegrationsTab';
import StatisticsTab from '../components/dashboard/StatisticsTab';
import OptimizeTab from '../components/dashboard/OptimizeTab';

type Tab = 'generate' | 'optimize' | 'integrations' | 'statistics';

export default function Dashboard({ onLogout }: { onLogout?: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('generate');
  const [generateInput, setGenerateInput] = useState('');

  const handleSelectProductForOptimization = (rawInput: string, title: string) => {
    setGenerateInput(rawInput);
    setActiveTab('generate');
  };

  const token = localStorage.getItem('token');
  let userName = 'Admin';
  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.name) {
        userName = payload.name;
      }
    } catch (e) {
      console.error('Failed to parse token', e);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans flex flex-col text-white">
      {/* ── Top Navigation Capsule ── */}
      <div className="fixed mt-1 top-2 left-0 right-0 z-50 rounded-[2rem] border-x border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-3xl mx-8">
        <div className="max-w-[1600px] mx-auto px-4">
          <header className="h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 w-40 pl-2">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-black font-bold text-sm">V</span>
              </div>
              <span className="font-medium text-lg tracking-tight text-white hidden sm:block">Verion</span>
            </div>

            {/* Expandable Center Nav */}
            <nav className="flex items-center gap-1.5 p-1 bg-[#141414] rounded-full border border-white/10">
              {[
                { id: 'generate', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>, label: 'Generate' },
                { id: 'optimize', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>, label: 'Optimize' },
                { id: 'integrations', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-5" /><path d="M9 8V2" /><path d="M15 8V2" /><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" /></svg>, label: 'Connect' },
                { id: 'statistics', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg>, label: 'Stats' }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`flex items-center overflow-hidden rounded-full h-9 transition-all duration-500 ease-out ${isActive
                      ? 'bg-white/15 text-white px-4 max-w-[150px]'
                      : 'text-neutral-500 hover:bg-white/5 px-0 w-9 hover:text-white justify-center max-w-[36px]'
                      }`}
                    title={tab.label}
                  >
                    <span className={`text-base shrink-0 flex items-center justify-center ${isActive ? 'mr-2' : ''}`}>{tab.icon}</span>
                    <span className={`whitespace-nowrap font-medium text-xs transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 w-0'}`}>
                      {tab.label}
                    </span>
                  </button>
                )
              })}
            </nav>

            {/* Right User & Logout */}
            <div className="flex items-center gap-3 w-40 justify-end pr-1">
              <div className="hidden sm:flex items-center gap-2">
                <div className="text-right">
                  <p className="text-xs font-medium text-white leading-tight">{userName}</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-xs border border-white/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-9 h-9 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                title="Logout"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
              </button>
            </div>
          </header>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <main className="flex-1 overflow-y-auto pt-24 pb-10 px-4 md:px-8 max-w-[1400px] mx-auto w-full">
        {activeTab === 'generate' && <GenerateTab initialInput={generateInput} />}
        {activeTab === 'optimize' && <OptimizeTab onSelectProduct={handleSelectProductForOptimization} />}
        {activeTab === 'integrations' && <IntegrationsTab />}
        {activeTab === 'statistics' && <StatisticsTab />}
      </main>


    </div>
  );
}
