'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PERMISSIONS } from '@/lib/constants';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProfile(sessionUser) {
      if (!sessionUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', sessionUser.email)
          .single();
        
        if (data) {
          setUser({ ...sessionUser, ...data });
        } else {
          // Fallback for demo/new users
          setUser({ ...sessionUser, position: 'Junior Executive' });
        }
      } catch (e) {
        setUser({ ...sessionUser, position: 'Junior Executive' });
      }
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      getProfile(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      getProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasPermission = (permission) => {
    if (!user || !user.position) return false;
    const userPerms = PERMISSIONS[user.position] || {};
    return userPerms.fullAccess || !!userPerms[permission];
  };

  return (
    <AuthContext.Provider value={{ user, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
