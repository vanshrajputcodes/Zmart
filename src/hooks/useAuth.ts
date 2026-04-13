import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        store.setSession(session);
        store.setUser(session?.user ?? null);

        if (session?.user) {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id);
          store.setRoles((roles ?? []).map((r: any) => r.role));
        } else {
          store.setRoles([]);
        }
        store.setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      store.setSession(session);
      store.setUser(session?.user ?? null);

      if (session?.user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);
        store.setRoles((roles ?? []).map((r: any) => r.role));
      }
      store.setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return store;
}
