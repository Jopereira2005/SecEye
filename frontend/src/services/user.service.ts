import type { AuthError, PostgrestError } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';

import type { IUser } from '../interfaces/user.interfaces';
import { supabase } from './supabase';

type Result<T> = { data: T | null; error: AuthError | PostgrestError | Error | null };

type UpdateProfilePayload = {
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string | null;
};

export async function getProfile(): Promise<Result<IUser>> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('getProfile auth error:', userError);
      return { data: null, error: userError };
    }

    if (!userData.user) {
      const error = new Error('Nenhum usuário autenticado.');
      console.error('getProfile:', error.message);
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
      console.error('getProfile query error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('getProfile exception:', error);
    return { data: null, error: error as Error };
  }
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<Result<IUser>> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('updateProfile auth error:', userError);
      return { data: null, error: userError };
    }

    if (!userData.user) {
      const error = new Error('Nenhum usuário autenticado.');
      console.error('updateProfile:', error.message);
      return { data: null, error };
    }

    const { data, error } = await supabase
      .from('users')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', userData.user.id)
      .select()
      .single<IUser>();

    if (error) {
      if (error.code === 'PGRST116' || error.code === '23503') {
        // Usuário não tem perfil na tabela (foi deletado)
        await supabase.auth.signOut();
        return { data: null, error: new Error('Sua conta foi excluída ou não existe mais.') };
      }

      // username único: código 23505 = unique_violation
      if (error.code === '23505') {
        const friendlyError = new Error('Este nome de usuário já está em uso.');
        console.error('updateProfile unique violation:', error);
        return { data: null, error: friendlyError };
      }

      console.error('updateProfile update error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('updateProfile exception:', error);
    return { data: null, error: error as Error };
  }
}

export async function uploadAvatar(imageBase64: string, userId: string, ext: string = 'jpg'): Promise<Result<string>> {
  try {
    const filePath = `${userId}/avatar-${Date.now()}.${ext}`;

    // Converter Base64 para ArrayBuffer usando base64-arraybuffer (Natível e sem fetch bugs no RN)
    const arrayBuffer = decode(imageBase64);

    // Fazer o upload para o bucket 'avatars'
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, arrayBuffer, {
        upsert: true,
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      });

    if (error) {
      console.error('uploadAvatar storage error:', error);
      return { data: null, error };
    }

    // Gerar e retornar a URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return { data: publicUrl, error: null };
  } catch (error) {
    console.error('uploadAvatar exception:', error);
    return { data: null, error: error as Error };
  }
}
