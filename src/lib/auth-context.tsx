import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
  currentUser: SupabaseUser | null;
  userRole: 'admin' | 'editor' | null;
  loading: boolean;
  hasAdminRegistered: boolean;
  refreshAdminStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'editor' | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAdminRegistered, setHasAdminRegistered] = useState(false);

  // Verifica se já existe pelo menos um admin registrado no Supabase
  const refreshAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('data')
        .eq('id', 'has_admin')
        .maybeSingle();
      if (error) throw error;
      setHasAdminRegistered(!!data && data.data?.registered === true);
    } catch (err) {
      console.error('Error checking admin registration status:', err);
      // Fallback: em caso de erro (ex: sem internet), assumimos 'true' para não
      // exibir a tela de criar um novo admin acidentalmente.
      setHasAdminRegistered(true);
    }
  };

  const loadUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      setUserRole((data?.role as 'admin' | 'editor' | undefined) || null);
    } catch (err) {
      console.error('Error fetching user role', err);
      setUserRole(null);
    }
  };

  useEffect(() => {
    refreshAdminStatus();

    // Trava de segurança: em alguns navegadores getSession() pode ficar
    // pendurado (bug conhecido do supabase-js com a lock de sessão via
    // navigator.locks, especialmente após reloads do HMR em dev). Sem esse
    // timeout, a tela de "Verificando Credenciais" nunca sai do carregamento.
    let settled = false;
    const safetyTimeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        console.warn('Tempo esgotado ao verificar sessão do Supabase; assumindo usuário deslogado.');
        setLoading(false);
      }
    }, 8000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (settled) return;
      settled = true;
      clearTimeout(safetyTimeout);
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        loadUserRole(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      if (settled) return;
      settled = true;
      clearTimeout(safetyTimeout);
      console.error('Erro ao verificar sessão do Supabase:', err);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        await loadUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userRole,
      loading,
      hasAdminRegistered,
      refreshAdminStatus,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
