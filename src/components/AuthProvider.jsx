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
          // New user - sync to public table with automated ID
          const year = new Date().getFullYear().toString().slice(-2);
          const position = 'Junior Executive';
          
          // Map positions to 2-letter codes
          const posCodes = {
            'Founder': 'FD',
            'Core Team': 'CT',
            'Senior Executive': 'SE',
            'Business Development Executive': 'BD',
            'Operations Executive': 'OE',
            'Marketing Executive': 'ME',
            'Junior Executive': 'JE'
          };
          
          // Use Junior Executive as default array
          const positions = [position];
          const code = posCodes[position] || 'XX';
          const seqKey = `seq_${code}`;

          // Get and increment persistent sequence for this position
          const { data: seqData, error: seqError } = await supabase
            .from('app_settings')
            .select('value_int')
            .eq('id', seqKey)
            .single();
          
          let nextSeq = (seqData?.value_int || 0) + 1;
          
          if (seqData) {
            await supabase
              .from('app_settings')
              .update({ value_int: nextSeq })
              .eq('id', seqKey);
          } else {
            // Backup - initialize if missing for some reason
            await supabase
              .from('app_settings')
              .insert({ id: seqKey, value_int: nextSeq });
          }
          
          const sequence = nextSeq.toString().padStart(4, '0');
          const employeeId = `NL-${year}-${code}-${sequence}`;

          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              email: sessionUser.email,
              name: sessionUser.user_metadata?.full_name || sessionUser.email.split('@')[0],
              position: positions,
              employee_id: employeeId,
              status: 'Active',
              department: []
            })
            .select()
            .single();
          
          if (newUser) {
            setUser({ ...sessionUser, ...newUser });
          } else {
            setUser({ ...sessionUser, position: positions });
          }
        }
      } catch (e) {
        setUser({ ...sessionUser, position: ['Junior Executive'] });
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
    if (!user || !user.position || !Array.isArray(user.position)) return false;
    
    return user.position.some(pos => {
      const userPerms = PERMISSIONS[pos] || {};
      return userPerms.fullAccess || !!userPerms[permission];
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
