import { SupabaseClient } from '@supabase/supabase-js';
import { IEstablishmentsRepository } from '@/lib/core/repositories/establishments-repository.interface';
import { Establishment } from '@/lib/core/entities/establishment';

export class SupabaseEstablishmentsRepository implements IEstablishmentsRepository {
  constructor(private supabase: SupabaseClient) {}

  async getById(id: string): Promise<Establishment | null> {
    const { data, error } = await this.supabase
      .from('establishments')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return data as Establishment;
  }

  async getBySlug(profileId: string, slug: string): Promise<Establishment | null> {
    const { data, error } = await this.supabase
      .from('establishments')
      .select('*')
      .eq('profile_id', profileId)
      .eq('custom_link', slug)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return data as Establishment;
  }

  async listByCompany(profileId: string): Promise<Establishment[]> {
    const { data, error } = await this.supabase
      .from('establishments')
      .select('*')
      .eq('profile_id', profileId)
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error listing establishments:', error);
      return [];
    }
    return data as Establishment[];
  }

  async create(data: Omit<Establishment, 'id' | 'created_at' | 'updated_at'>): Promise<Establishment> {
    const { data: created, error } = await this.supabase
      .from('establishments')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create establishment: ${error.message}`);
    }

    return created as Establishment;
  }

  async update(id: string, data: Partial<Establishment>): Promise<Establishment> {
    const { data: updated, error } = await this.supabase
      .from('establishments')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update establishment: ${error.message}`);
    }

    return updated as Establishment;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('establishments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting establishment:', error);
      return false;
    }
    return true;
  }
}
