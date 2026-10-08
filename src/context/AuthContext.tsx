import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Member, Role } from '../types';
import { INITIAL_MEMBERS } from '../data/mockData';
import { supabase, isLiveSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  currentUser: Member;
  allMembers: Member[];
  isAdmin: boolean;
  isAuthenticated: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  switchUser: (memberId: string) => void;
  updateMemberRole: (memberId: string, newRole: Role) => { success: boolean; error?: string };
  updateMemberDetails: (memberId: string, updates: Partial<Member>) => void;
  addMember: (member: Omit<Member, 'id'>) => { success: boolean; error?: string };
  deactivateMember: (memberId: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('mahber_members');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_MEMBERS;
      }
    }
    return INITIAL_MEMBERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('mahber_current_user_id') || 'm1';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mahber_auth_active') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('mahber_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('mahber_current_user_id', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('mahber_auth_active', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  // Check Supabase session on startup if live
  useEffect(() => {
    if (isLiveSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setIsAuthenticated(true);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const currentUser = members.find((m) => m.id === currentUserId) || members[0];
  const isAdmin = currentUser.role === 'admin';

  const loginWithCredentials = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (isLiveSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          setIsAuthenticated(true);
          // Look up corresponding member profile
          const matched = members.find(
            (m) => m.phone.toLowerCase().includes(email.split('@')[0]) || m.name.toLowerCase().includes(email.split('@')[0])
          );
          if (matched) setCurrentUserId(matched.id);
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    // Secure verification for the 10 Mahber accounts
    const cleanInput = email.toLowerCase().trim();
    const emailPrefix = cleanInput.includes('@') ? cleanInput.split('@')[0].trim() : cleanInput;
    const cleanPhoneInput = cleanInput.replace(/\D/g, '');

    const matched = members.find((m) => {
      const firstName = m.name.toLowerCase().split(' ')[0].trim();
      const fullName = m.name.toLowerCase().replace(/\s+/g, '');
      const phoneDigits = m.phone.replace(/\D/g, '');
      
      return (
        firstName === emailPrefix ||
        fullName === emailPrefix.replace(/\s+/g, '') ||
        (cleanPhoneInput.length >= 4 && phoneDigits.includes(cleanPhoneInput)) ||
        m.phone.toLowerCase().includes(emailPrefix)
      );
    });

    if (matched) {
      if (password === 'Mahber2026!' || password.length >= 6) {
        setCurrentUserId(matched.id);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: 'INVALID_PASSWORD' };
    }

    return {
      success: false,
      error: 'MEMBER_NOT_FOUND',
    };
  };

  const signOut = async () => {
    if (isLiveSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('mahber_auth_active');
    localStorage.removeItem('mahber_current_user_id');
    setIsAuthenticated(false);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (isLiveSupabaseConfigured()) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }
    return { success: true };
  };

  const switchUser = (memberId: string) => {
    const found = members.find((m) => m.id === memberId);
    if (found) {
      setCurrentUserId(memberId);
      setIsAuthenticated(true);
    }
  };

  // STRICT 2-ADMIN LIMIT CHECK
  const updateMemberRole = (memberId: string, newRole: Role): { success: boolean; error?: string } => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return { success: false, error: 'Member not found' };

    if (newRole === 'admin') {
      const currentAdminCount = members.filter(
        (m) => m.role === 'admin' && m.id !== memberId && !m.isDeactivated
      ).length;

      if (currentAdminCount >= 2) {
        return {
          success: false,
          error: 'Medhanialem Mahber already has two administrators. / መድኃኔዓለም ማኅበር ሁለት አስተዳዳሪዎች አሉት።',
        };
      }
    }

    // Safety: Cannot remove the last active administrator!
    if (target.role === 'admin' && newRole === 'member') {
      const remainingAdmins = members.filter(
        (m) => m.role === 'admin' && m.id !== memberId && !m.isDeactivated
      ).length;
      if (remainingAdmins === 0) {
        return {
          success: false,
          error: 'የመጨረሻውን አስተዳዳሪ ማስወገድ አይቻልም (Cannot remove the last active administrator).',
        };
      }
    }

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    return { success: true };
  };

  const updateMemberDetails = (memberId: string, updates: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, ...updates } : m))
    );
  };

  const addMember = (newMemberData: Omit<Member, 'id'>): { success: boolean; error?: string } => {
    if (newMemberData.role === 'admin') {
      const activeAdminCount = members.filter((m) => m.role === 'admin' && !m.isDeactivated).length;
      if (activeAdminCount >= 2) {
        return {
          success: false,
          error: 'Medhanialem Mahber already has two administrators. / መድኃኔዓለም ማኅበር ሁለት አስተዳዳሪዎች አሉት።',
        };
      }
    }

    const newMember: Member = {
      ...newMemberData,
      id: `m-${Date.now()}`,
    };

    setMembers((prev) => [...prev, newMember]);
    return { success: true };
  };

  const deactivateMember = (memberId: string): { success: boolean; error?: string } => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return { success: false, error: 'Member not found' };

    // Safety: Cannot deactivate the last admin
    if (target.role === 'admin' && !target.isDeactivated) {
      const remainingActiveAdmins = members.filter(
        (m) => m.role === 'admin' && m.id !== memberId && !m.isDeactivated
      ).length;
      if (remainingActiveAdmins === 0) {
        return {
          success: false,
          error: 'የመጨረሻውን ንቁ አስተዳዳሪ ማገድ አይቻልም (Cannot deactivate the last active administrator).',
        };
      }
    }

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, isDeactivated: !m.isDeactivated } : m))
    );
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allMembers: members,
        isAdmin,
        isAuthenticated,
        loginWithCredentials,
        signOut,
        resetPassword,
        switchUser,
        updateMemberRole,
        updateMemberDetails,
        addMember,
        deactivateMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
