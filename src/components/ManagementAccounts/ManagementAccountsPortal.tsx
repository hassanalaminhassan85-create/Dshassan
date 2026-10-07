import React, { useState, useEffect } from 'react';
import { ManagementRoleCode, ManagementUserSession } from '../../types/management';
import { 
  getStoredSessionToken, 
  getStoredSessionUser,
  apiManagementVerifySession, 
  clearStoredSessionToken 
} from '../../lib/managementApi';
import { ManagementLandingView } from './ManagementLandingView';
import { ManagementLoginView } from './ManagementLoginView';
import { ManagementDashboard } from './ManagementDashboard';
import { Logo } from '../Logo';

interface ManagementAccountsPortalProps {
  initialView?: 'landing' | 'login' | 'dashboard';
  initialRole?: ManagementRoleCode | null;
  onNavigateHome: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  publishedCac?: any;
  onUpdatePath?: (path: string) => void;
}

export const ManagementAccountsPortal: React.FC<ManagementAccountsPortalProps> = ({
  initialView = 'landing',
  initialRole = null,
  onNavigateHome,
  theme,
  setTheme,
  publishedCac,
  onUpdatePath
}) => {
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>(initialView);
  const [selectedRole, setSelectedRole] = useState<ManagementRoleCode | null>(initialRole);
  const [userSession, setUserSession] = useState<ManagementUserSession | null>(null);
  const [verifyingSession, setVerifyingSession] = useState<boolean>(true);

  // Check stored session on mount once only
  useEffect(() => {
    let isMounted = true;
    async function verify() {
      const activeUser = getStoredSessionUser();
      const token = getStoredSessionToken() || activeUser?.token;
      if (!token && !activeUser) {
        if (isMounted) {
          setVerifyingSession(false);
          // If the user requested dashboard directly without token, prevent access and fall back to landing
          if (initialView === 'dashboard') {
            setView('landing');
            if (onUpdatePath) onUpdatePath('/management-accounts');
          }
        }
        return;
      }

      try {
        const result = await apiManagementVerifySession(token || undefined);
        if (isMounted && result.success && result.user) {
          setUserSession(result.user);
          setView('dashboard');
          if (onUpdatePath) onUpdatePath('/management/dashboard');
        } else if (isMounted && activeUser) {
          setUserSession(activeUser);
          setView('dashboard');
        }
      } catch (e) {
        if (isMounted) {
          if (activeUser) {
            setUserSession(activeUser);
            setView('dashboard');
          } else {
            clearStoredSessionToken();
            setUserSession(null);
            setView('landing');
            if (onUpdatePath) onUpdatePath('/management-accounts');
          }
        }
      } finally {
        if (isMounted) setVerifyingSession(false);
      }
    }

    verify();
    return () => {
      isMounted = false;
    };
  }, []); // Run on mount only

  // Handle selecting a role card on landing page
  const handleSelectRole = (role: ManagementRoleCode) => {
    setSelectedRole(role);
    setView('login');
    if (onUpdatePath) {
      onUpdatePath(`/management-accounts?role=${role}`);
    }
  };

  // Handle successful login
  const handleLoginSuccess = (session: ManagementUserSession) => {
    setUserSession(session);
    setView('dashboard');
    if (onUpdatePath) {
      onUpdatePath('/management/dashboard');
    }
  };

  // Handle logout
  const handleLogout = () => {
    clearStoredSessionToken();
    setUserSession(null);
    setSelectedRole(null);
    setView('landing');
    if (onUpdatePath) {
      onUpdatePath('/management-accounts');
    }
  };

  // Return to role selection
  const handleBackToRoleSelection = () => {
    setSelectedRole(null);
    setView('landing');
    if (onUpdatePath) {
      onUpdatePath('/management-accounts');
    }
  };

  if (verifyingSession) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-slate-200 dark:border-slate-800 border-t-orange-500 rounded-full animate-spin" />
          <Logo size="sm" showText={false} className="absolute inset-0 m-auto" />
        </div>
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500 animate-pulse mt-2">
          Verifying Management Authorization...
        </p>
      </div>
    );
  }

  if (view === 'dashboard' && userSession) {
    return (
      <ManagementDashboard
        userSession={userSession}
        onLogout={handleLogout}
        onNavigateHome={onNavigateHome}
        theme={theme}
        setTheme={setTheme}
        publishedCac={publishedCac}
      />
    );
  }

  if (view === 'login' && selectedRole) {
    return (
      <ManagementLoginView
        selectedRole={selectedRole}
        onLoginSuccess={handleLoginSuccess}
        onBackToRoleSelection={handleBackToRoleSelection}
        onNavigateHome={onNavigateHome}
        theme={theme}
        publishedCac={publishedCac}
      />
    );
  }

  return (
    <ManagementLandingView
      onSelectRole={handleSelectRole}
      onNavigateHome={onNavigateHome}
      theme={theme}
      publishedCac={publishedCac}
    />
  );
};
