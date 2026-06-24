import { SupabaseClient } from '@supabase/supabase-js';
import { IProfilesRepository } from '@/lib/core/repositories/profiles-repository.interface';
import { Profile } from '@/lib/core/entities/profile';

export class SupabaseProfilesRepository implements IProfilesRepository {
  constructor(private supabase: SupabaseClient) {}

  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return data as Profile;
  }

  async update(id: string, data: Partial<Profile>): Promise<Profile> {
    const { data: updated, error } = await this.supabase
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return updated as Profile;
  }
}
