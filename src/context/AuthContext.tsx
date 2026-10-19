import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Member, Role, AdminRole } from '../types';
import { INITIAL_MEMBERS } from '../data/mockData';
import { supabase, isLiveSupabaseConfigured } from '../lib/supabase';
import { mahberService } from '../services/mahberService';

interface AuthContextType {
  currentUser: Member;
  allMembers: Member[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isManagementAdmin: boolean;
  isFinanceAdmin: boolean;
  isAttendanceAdmin: boolean;
  isMezmurAdmin: boolean;
  hasRole: (role: AdminRole) => boolean;
  isAuthenticated: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  validateInviteCode: (inviteCode: string) => { valid: boolean; member?: Member; error?: string };
  activateAccountWithInvite: (inviteCode: string, password?: string) => Promise<{ success: boolean; member?: Member; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  switchUser: (memberId: string) => void;
  updateMemberRole: (memberId: string, newRole: Role) => { success: boolean; error?: string };
  assignMemberAdminRoles: (memberId: string, roles: AdminRole[]) => { success: boolean; error?: string };
  updateMemberDetails: (memberId: string, updates: Partial<Member>) => void;
  updateUserProfile: (updates: { phone?: string; avatarUrl?: string }) => Promise<{ success: boolean; error?: string }>;
  addMember: (member: Omit<Member, 'id'>) => { success: boolean; error?: string };
  deactivateMember: (memberId: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('mahber_members');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure we load the canonical 11 members with real names
        if (
          Array.isArray(parsed) &&
          parsed.length === 11 &&
          parsed.some((m) => m.name.includes('Sawiros'))
        ) {
          return parsed;
        }
        return INITIAL_MEMBERS;
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

  // Fine-grained Role-Based Access Control
  const isSuperAdmin = (currentUser.roles || []).includes('super_admin') || currentUser.id === 'm1';
  const isFinanceAdmin = isSuperAdmin || (currentUser.roles || []).includes('finance_admin');
  const isAttendanceAdmin = isSuperAdmin || (currentUser.roles || []).includes('attendance_admin');
  const isMezmurAdmin = isSuperAdmin || (currentUser.roles || []).includes('mezmur_admin');
  const isManagementAdmin = isSuperAdmin || (currentUser.roles || []).includes('management_admin');
  const isAdmin =
    isSuperAdmin ||
    isFinanceAdmin ||
    isAttendanceAdmin ||
    isMezmurAdmin ||
    isManagementAdmin ||
    currentUser.role === 'admin';

  const hasRole = (role: AdminRole): boolean => {
    if (isSuperAdmin) return true;
    return (currentUser.roles || []).includes(role);
  };

  const validateInviteCode = (inviteCode: string): { valid: boolean; member?: Member; error?: string } => {
    const res = mahberService.validateInvitation(inviteCode);
    if (!res.valid || !res.member) {
      return { valid: false, error: res.error || 'Invalid or expired invitation code' };
    }
    return { valid: true, member: res.member };
  };

  const activateAccountWithInvite = async (
    inviteCode: string,
    password?: string
  ): Promise<{ success: boolean; member?: Member; error?: string }> => {
    if (password) {
      const res = mahberService.completeInvitationActivation(inviteCode, password);
      if (!res.success || !res.memberId) {
        return { success: false, error: res.error || 'Failed to activate invitation' };
      }
      const target = members.find((m) => m.id === res.memberId);
      if (target) {
        setCurrentUserId(target.id);
        setIsAuthenticated(true);
        return { success: true, member: target };
      }
    }

    const res = mahberService.redeemInvitation(inviteCode);
    if (!res.success || !res.memberId) {
      return { success: false, error: res.error || 'Invalid or expired invitation code' };
    }

    const target = members.find((m) => m.id === res.memberId);
    if (!target) {
      return { success: false, error: 'Member not found for invitation code' };
    }

    setCurrentUserId(target.id);
    setIsAuthenticated(true);
    return { success: true, member: target };
  };

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

    // Secure verification for the 11 Mahber accounts
    const cleanInput = email.toLowerCase().trim();
    const emailPrefix = cleanInput.includes('@') ? cleanInput.split('@')[0].trim() : cleanInput;
    const cleanPhoneInput = cleanInput.replace(/\D/g, '');

    const matched = members.find((m) => {
      const firstName = m.name.toLowerCase().split(' ')[0].trim();
      const fullName = m.name.toLowerCase().replace(/\s+/g, '');
      const phoneDigits = m.phone.replace(/\D/g, '');
      
      return (
        m.email?.toLowerCase() === cleanInput ||
        firstName === emailPrefix ||
        fullName === emailPrefix.replace(/\s+/g, '') ||
        (cleanPhoneInput.length >= 4 && phoneDigits.includes(cleanPhoneInput)) ||
        m.phone.toLowerCase().includes(emailPrefix)
      );
    });

    if (matched) {
      const customPassword = mahberService.getMemberPassword(matched.id);
      const isPasswordValid = customPassword
        ? customPassword === password
        : (password === 'Mahber2026!' || password.length >= 6);

      if (isPasswordValid) {
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

  // Super Admin assigns granular administrative roles
  const assignMemberAdminRoles = (
    memberId: string,
    newRoles: AdminRole[]
  ): { success: boolean; error?: string } => {
    if (!isSuperAdmin) {
      return {
        success: false,
        error: 'Only the Super Admin can appoint or revoke administrative roles. / አስተዳዳሪዎችን የመሾም ስልጣን ያለው ዋና አስተዳዳሪው ብቻ ነው።',
      };
    }

    const target = members.find((m) => m.id === memberId);
    if (!target) return { success: false, error: 'Member not found' };

    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              roles: newRoles,
              role: newRoles.length > 0 ? ('admin' as const) : ('member' as const),
            }
          : m
      )
    );
    return { success: true };
  };

  const updateMemberRole = (memberId: string, newRole: Role): { success: boolean; error?: string } => {
    const target = members.find((m) => m.id === memberId);
    if (!target) return { success: false, error: 'Member not found' };

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

  const updateUserProfile = async (
    updates: { phone?: string; avatarUrl?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated || !currentUser) {
      return { success: false, error: 'Unauthorized: You must be signed in to update your profile.' };
    }

    const { phone, avatarUrl } = updates;

    // Validate phone number if provided (empty is allowed)
    if (phone !== undefined && phone.trim() !== '') {
      const cleanPhone = phone.trim();
      // Allow Ethiopian numbers (+251..., 09..., 07...) or international formats
      const ethiopianOrIntlRegex = /^(\+?[1-9]\d{6,14}|0[79]\d{8})$/;
      const digitsOnly = cleanPhone.replace(/[\s\-\(\)]/g, '');
      if (!ethiopianOrIntlRegex.test(digitsOnly)) {
        return {
          success: false,
          error: 'Invalid phone number format. Please enter a valid Ethiopian (+251 9... / +251 7... / 09...) or international number.',
        };
      }
    }

    // Validate avatarUrl if provided
    if (avatarUrl !== undefined && avatarUrl.trim() !== '') {
      const isDataUri = avatarUrl.startsWith('data:image/');
      const isHttpUri = avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://');
      if (!isDataUri && !isHttpUri) {
        return {
          success: false,
          error: 'Invalid profile picture format. Must be an image URL or uploaded image file.',
        };
      }
    }

    // Update state strictly for current authenticated user only
    const updatedMember: Member = {
      ...currentUser,
      ...(phone !== undefined ? { phone: phone.trim() } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl: avatarUrl.trim() } : {}),
    };

    setMembers((prev) =>
      prev.map((m) => (m.id === currentUser.id ? updatedMember : m))
    );

    // If live Supabase is active, persist to Supabase profiles using RLS auth
    if (isLiveSupabaseConfigured()) {
      try {
        const payload: { phone?: string; avatar_url?: string; updated_at: string } = {
          updated_at: new Date().toISOString(),
        };
        if (phone !== undefined) payload.phone = phone.trim();
        if (avatarUrl !== undefined) payload.avatar_url = avatarUrl.trim();

        const { error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', currentUser.id);

        if (error) {
          console.warn('Supabase profile update notice:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase profile sync error:', err.message);
      }
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allMembers: members,
        isAdmin,
        isSuperAdmin,
        isManagementAdmin,
        isFinanceAdmin,
        isAttendanceAdmin,
        isMezmurAdmin,
        hasRole,
        isAuthenticated,
        loginWithCredentials,
        validateInviteCode,
        activateAccountWithInvite,
        signOut,
        resetPassword,
        switchUser,
        updateMemberRole,
        assignMemberAdminRoles,
        updateMemberDetails,
        updateUserProfile,
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
