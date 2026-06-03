import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthError, PostgrestError, Session, User as AuthUser } from '@supabase/supabase-js';

import type { IUser } from '@/interfaces/user.interfaces';
import { getProfile } from '@/services/user.service';
import { getSession, onAuthStateChange, signIn, signOut, signUp } from '@/services/auth.service';
import { useQueryClient } from '@tanstack/react-query';

type SignInResult = ReturnType<typeof signIn>;
type SignUpResult = ReturnType<typeof signUp>;
type SignOutResult = ReturnType<typeof signOut>;

type AuthContextValue = {
  user: AuthUser | null;
  profile: IUser | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | AuthError | PostgrestError | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => SignInResult;
  signUp: (
    email: string,
    password: string,
    username: string,
    firstName?: string,
    lastName?: string
  ) => SignUpResult;
  signOut: () => SignOutResult;
  refreshProfile: () => Promise<IUser | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<IUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | AuthError | PostgrestError | null>(null);
  const queryClient = useQueryClient();

  const refreshProfile = useCallback(async () => {
    try {
      const { data, error: profileError } = await getProfile();
      if (profileError) {
        setError(profileError);
        setProfile(null);
        return null;
      }

      setProfile(data);
      return data;
    } catch (refreshError) {
      const exception = refreshError as Error;
      setError(exception);
      setProfile(null);
      return null;
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    setIsLoading(true);

    try {
      const { data: sessionData, error: sessionError } = await getSession();
      if (sessionError) {
        setError(sessionError);
      }

      setSession(sessionData);
      setUser(sessionData?.user ?? null);

      if (sessionData?.user) {
        await refreshProfile();
      } else {
        setProfile(null);
      }
    } catch (initError) {
      setError(initError as Error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshProfile]);

  useEffect(() => {
    initializeAuth();

    const { data: authListener } = onAuthStateChange(async (_, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        await refreshProfile();
      } else {
        setProfile(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [initializeAuth, refreshProfile]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await signIn(email, password);
        if (!result.error) {
          setSession(result.data?.session ?? null);
          setUser(result.data?.user ?? null);
          // O refreshProfile será chamado automaticamente pelo onAuthStateChange listener
        } else {
          setError(result.error);
        }
        return result;
      } catch (e) {
        setError(e as Error);
        return { data: null, error: e as Error };
      }
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (
      email: string,
      password: string,
      username: string,
      firstName = '',
      lastName = ''
    ) => {
      try {
        const result = await signUp(email, password, username, firstName, lastName);
        if (!result.error) {
          setSession(result.data?.session ?? null);
          setUser(result.data?.user ?? null);
          setProfile(result.data?.profile ?? null);
        } else {
          setError(result.error);
        }
        return result;
      } catch (e) {
        setError(e as Error);
        return { data: null, error: e as Error };
      }
    },
    []
  );

  const signOutUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await signOut();
      if (!result.error) {
        setUser(null);
        setSession(null);
        setProfile(null);
        queryClient.clear();
      } else {
        setError(result.error);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      profile,
      session,
      isLoading,
      error,
      isAuthenticated: !!user,
      signIn: signInWithEmail,
      signUp: signUpWithEmail,
      signOut: signOutUser,
      refreshProfile,
    }),
    [error, isLoading, profile, refreshProfile, signInWithEmail, signOutUser, signUpWithEmail, user, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
