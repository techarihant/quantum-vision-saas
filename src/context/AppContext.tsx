'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization, User, UserRole, WhatsAppAccount } from '@/lib/types';

interface AppContextType {
  currentOrg: Organization;
  setCurrentOrg: (org: Organization) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  whatsappAccount: WhatsAppAccount | null;
  refreshAccount: () => void;
  orgs: Organization[];
  users: User[];
  isDemoMode: boolean;
  setIsDemoMode: (demo: boolean) => void;
}

const defaultOrg: Organization = {
  id: 'org_dobcy',
  name: 'Dobcy',
  slug: 'dobcy',
  logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
  plan: 'Enterprise',
  messageLimit: 500000,
  contactsLimit: 100000,
  createdAt: '2025-01-10T08:00:00Z'
};

const defaultUser: User = {
  id: 'usr_arihant',
  name: 'Arihant',
  email: 'arihant@quantumvision.in',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'owner',
  createdAt: '2025-01-10T08:00:00Z'
};

const availableOrgs: Organization[] = [
  defaultOrg,
  {
    id: 'org_quantumvision',
    name: 'Quantum Vision Labs',
    slug: 'quantum-vision-labs',
    logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
    plan: 'Enterprise',
    messageLimit: 1000000,
    contactsLimit: 500000,
    createdAt: '2025-02-01T10:00:00Z'
  }
];

const availableUsers: User[] = [
  defaultUser,
  {
    id: 'usr_priya',
    name: 'Priya Patel',
    email: 'priya@quantumvision.in',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    createdAt: '2025-01-12T09:30:00Z'
  },
  {
    id: 'usr_neha',
    name: 'Neha Singh',
    email: 'neha@quantumvision.in',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'agent',
    createdAt: '2025-01-20T14:15:00Z'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentOrg, setCurrentOrg] = useState<Organization>(defaultOrg);
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);
  const [whatsappAccount, setWhatsappAccount] = useState<WhatsAppAccount | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  const fetchAccount = async () => {
    try {
      const res = await fetch(`/api/settings/whatsapp?orgId=${currentOrg.id}`);
      if (res.ok) {
        const data = await res.json();
        setWhatsappAccount(data);
        setIsDemoMode(data.providerMode === 'demo');
      }
    } catch (err) {
      console.error('Failed to load WhatsApp Account settings', err);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, [currentOrg]);

  return (
    <AppContext.Provider
      value={{
        currentOrg,
        setCurrentOrg,
        currentUser,
        setCurrentUser,
        whatsappAccount,
        refreshAccount: fetchAccount,
        orgs: availableOrgs,
        users: availableUsers,
        isDemoMode,
        setIsDemoMode
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
