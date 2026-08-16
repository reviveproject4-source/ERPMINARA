import { useState } from 'react';
import type { UserRole, Prospect } from './types/database';
import { systemStore } from './lib/supabase';
import { Navigation } from './components/Navigation';
import { SalesDashboard } from './components/SalesDashboard';
import { OwnerDashboard } from './components/OwnerDashboard';
import { CSDashboard } from './components/CSDashboard';
import { ProspectModal } from './components/ProspectModal';
import { SystemConfigModal } from './components/SystemConfigModal';
import { AuditLogModal } from './components/AuditLogModal';
import { SecurityTestModal } from './components/SecurityTestModal';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('sales');
  const [activeTab, setActiveTab] = useState<'sales' | 'owner' | 'cs'>('sales');

  // State Data
  const [prospects, setProspects] = useState<Prospect[]>(() => systemStore.getProspects(undefined, currentRole));
  const [proposals, setProposals] = useState(() => systemStore.getProposals());
  const [deals, setDeals] = useState(() => systemStore.getDeals());
  const [csTenants, setCsTenants] = useState(() => systemStore.getCSTenants());
  const [supportTickets, setSupportTickets] = useState(() => systemStore.getSupportTickets());
  const [reactivationLeads, setReactivationLeads] = useState(() => systemStore.getReactivationLeads());
  const [auditLogs, setAuditLogs] = useState(() => systemStore.getAuditLogs());

  // Modals
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null | undefined>(undefined);
  const [isProspectModalOpen, setIsProspectModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSecurityTestModalOpen, setIsSecurityTestModalOpen] = useState(false);

  const refreshData = () => {
    setProspects(systemStore.getProspects(undefined, currentRole));
    setProposals(systemStore.getProposals());
    setDeals(systemStore.getDeals());
    setCsTenants(systemStore.getCSTenants());
    setSupportTickets(systemStore.getSupportTickets());
    setReactivationLeads(systemStore.getReactivationLeads());
    setAuditLogs(systemStore.getAuditLogs());
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    systemStore.setCurrentEmployeeRole(role);
    if (role === 'founder' || role === 'manager') setActiveTab('owner');
    else if (role === 'cs') setActiveTab('cs');
    else setActiveTab('sales');
    refreshData();
  };

  const handleOpenProspectModal = (prospect?: Prospect) => {
    setSelectedProspect(prospect);
    setIsProspectModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Navigation
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onOpenConfig={() => setIsConfigModalOpen(true)}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        onOpenSecurityTest={() => setIsSecurityTestModalOpen(true)}
        onDataCleared={refreshData}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          refreshData();
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'sales' && (
          <SalesDashboard
            prospects={prospects}
            proposals={proposals}
            deals={deals}
            onOpenProspectModal={handleOpenProspectModal}
            onRefresh={refreshData}
          />
        )}

        {activeTab === 'owner' && (
          <OwnerDashboard
            prospects={prospects}
            proposals={proposals}
            deals={deals}
            onRefresh={refreshData}
          />
        )}

        {activeTab === 'cs' && (
          <CSDashboard
            csTenants={csTenants}
            supportTickets={supportTickets}
            reactivationLeads={reactivationLeads}
            onRefresh={refreshData}
          />
        )}
      </main>

      {/* Modals */}
      {isProspectModalOpen && (
        <ProspectModal
          prospect={selectedProspect}
          onClose={() => { setIsProspectModalOpen(false); setSelectedProspect(undefined); }}
          onSaved={() => { refreshData(); }}
        />
      )}

      {isConfigModalOpen && (
        <SystemConfigModal
          onClose={() => setIsConfigModalOpen(false)}
          onSaved={() => { refreshData(); }}
        />
      )}

      {isAuditModalOpen && (
        <AuditLogModal
          logs={auditLogs}
          onClose={() => setIsAuditModalOpen(false)}
        />
      )}

      {isSecurityTestModalOpen && (
        <SecurityTestModal
          onClose={() => setIsSecurityTestModalOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-4 text-center text-xs text-gray-500 bg-[#070a11]">
        <span>Minara Business Operating System (BOS) • Sales & CS BOS Integration</span>
      </footer>

    </div>
  );
}

export default App;
