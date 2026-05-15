import type {
  AuthChangeEvent,
  AuthError,
  PostgrestError,
  Session,
  User as AuthUser,
} from '@supabase/supabase-js';

import type { User } from '../types/supabase';
import { supabase } from './supabase';

type Result<T> = { data: T | null; error: AuthError | PostgrestError | Error | null };

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  username: string
): Promise<Result<{ user: AuthUser | null; session: Session | null; profile: User | null }>> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('signUp auth error:', authError);
      return { data: null, error: authError };
    }

    if (!authData.user) {
      return {
        data: { user: null, session: authData.session, profile: null },
        error: null,
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        username,
        first_name: firstName,
        last_name: lastName,
      })
      .select()
      .single<User>();

    if (profileError) {
      console.error('signUp profile error:', profileError);
      return { data: null, error: profileError };
    }

    return {
      data: { user: authData.user, session: authData.session, profile },
      error: null,
    };
  } catch (error) {
    console.error('signUp exception:', error);
    return { data: null, error: error as Error };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<Result<{ user: AuthUser | null; session: Session | null }>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('signIn error:', error);
      return { data: null, error };
    }

    return { data: { user: data.user, session: data.session }, error: null };
  } catch (error) {
    console.error('signIn exception:', error);
    return { data: null, error: error as Error };
  }
}

export async function signOut(): Promise<Result<null>> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('signOut error:', error);
      return { data: null, error };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('signOut exception:', error);
    return { data: null, error: error as Error };
  }
}

export async function getCurrentUser(): Promise<Result<AuthUser | null>> {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('getCurrentUser error:', error);
      return { data: null, error };
    }

    return { data: data.user, error: null };
  } catch (error) {
    console.error('getCurrentUser exception:', error);
    return { data: null, error: error as Error };
  }
}

export async function getSession(): Promise<Result<Session | null>> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('getSession error:', error);
      return { data: null, error };
    }

    return { data: data.session, error: null };
  } catch (error) {
    console.error('getSession exception:', error);
    return { data: null, error: error as Error };
  }
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}

export async function updatePushToken(token: string): Promise<Result<User>> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('updatePushToken auth error:', userError);
      return { data: null, error: userError };
    }

    if (!userData.user) {
      const error = new Error('Nenhum usuário autenticado.');
      console.error('updatePushToken:', error.message);
      return { data: null, error };
    }

    const { data, error } = await supabase
      .from('users')
      .update({ push_token: token })
      .eq('id', userData.user.id)
      .select()
      .single<User>();

    if (error) {
      console.error('updatePushToken update error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('updatePushToken exception:', error);
    return { data: null, error: error as Error };
  }
}
