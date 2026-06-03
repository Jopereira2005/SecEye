import type {
  AuthChangeEvent,
  AuthError,
  PostgrestError,
  Session,
  User as AuthUser,
} from '@supabase/supabase-js';

import type { IUser } from '../interfaces/user.interfaces';
import { supabase } from './supabase';

type Result<T> = { data: T | null; error: AuthError | PostgrestError | Error | null };

export async function signUp(
  email: string,
  password: string,
  username: string,
  firstName = '',
  lastName = ''
): Promise<Result<{ user: AuthUser | null; session: Session | null; profile: IUser | null }>> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          first_name: firstName || username,
          last_name: lastName || '',
        }
      }
    });

    if (authError) {
      console.warn('signUp auth error:', authError.message);
      return { data: null, error: authError };
    }

    if (!authData.user) {
      return {
        data: { user: null, session: authData.session, profile: null },
        error: null,
      };
    }

    // Se não houver sessão, significa que a confirmação de e-mail está ativada.
    // O banco de dados (via RLS) bloqueará a inserção manual pelo frontend.
    // Neste caso, retornamos sem tentar o insert (um Database Trigger deve criar o perfil).
    if (!authData.session) {
      return {
        data: { user: authData.user, session: null, profile: null },
        error: null,
      };
    }

    // Como você criou o Gatilho (Trigger) no banco de dados, o perfil já foi inserido automaticamente!
    // Portanto, não tentamos mais dar um "insert", apenas consultamos (select) o perfil recém-criado.
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select()
      .eq('id', authData.user.id)
      .single<IUser>();

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
  emailOrUsername: string,
  password: string
): Promise<Result<{ user: AuthUser | null; session: Session | null }>> {
  try {
    let loginEmail = emailOrUsername.trim();

    // Se não tiver '@', assumimos que é um username e buscamos o email dele via RPC
    if (!loginEmail.includes('@')) {
      const { data: emailData, error: rpcError } = await supabase.rpc('get_email_by_username', {
        p_username: loginEmail
      });

      if (rpcError || !emailData) {
        return { data: null, error: new Error('Usuário não encontrado ou erro de conexão.') };
      }
      
      loginEmail = emailData;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
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
      if (error.message?.includes('Refresh Token')) {
        console.warn('getCurrentUser warning: Sessão expirada.');
      } else {
        console.error('getCurrentUser error:', error);
      }
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
      if (error.message?.includes('Refresh Token')) {
        console.warn('getSession warning: Sessão expirada ou token inválido.');
      } else {
        console.error('getSession error:', error);
      }
      return { data: null, error };
    }

    return { data: data.session, error: null };
  } catch (error) {
    console.error('getSession exception:', error);
    return { data: null, error: error as Error };
  }
}

export async function getCurrentProfile(): Promise<Result<IUser | null>> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('getCurrentProfile auth error:', userError);
      return { data: null, error: userError };
    }

    if (!userData.user) {
      const error = new Error('Nenhum usuário autenticado.');
      console.error('getCurrentProfile:', error.message);
      return { data: null, error };
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userData.user.id)
      .single<IUser>();

    if (error) {
      if (error.code === 'PGRST116') {
        // Usuário não tem perfil na tabela (foi deletado)
        await supabase.auth.signOut();
        return { data: null, error: new Error('Sua conta foi excluída ou não existe mais.') };
      }
      console.error('getCurrentProfile query error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('getCurrentProfile exception:', error);
    return { data: null, error: error as Error };
  }
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}

export async function updatePushToken(token: string): Promise<Result<IUser>> {
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
      .single<IUser>();

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
