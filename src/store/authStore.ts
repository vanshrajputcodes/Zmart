import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';

type AppRole = 'super_admin' | 'admin' | 'customer';

interface AuthState {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setRoles: (roles: AppRole[]) => void;
  setLoading: (loading: boolean) => void;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  roles: [],
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setRoles: (roles) => set({ roles }),
  setLoading: (loading) => set({ loading }),
  isAdmin: () => {
    const { roles } = get();
    return roles.includes('admin') || roles.includes('super_admin');
  },
  isSuperAdmin: () => get().roles.includes('super_admin'),
  reset: () => set({ user: null, session: null, roles: [], loading: false }),
}));
