import { SupabaseClient } from '@supabase/supabase-js';
import { IClaimsRepository } from '@/lib/core/repositories/claims-repository.interface';
import { Claim, ClaimInsertInput, ClaimUpdateInput } from '@/lib/core/entities/claim';

export class SupabaseClaimsRepository implements IClaimsRepository {
  constructor(private supabase: SupabaseClient) {}

  async getById(id: string): Promise<Claim | null> {
    const { data, error } = await this.supabase
      .from('claims')
      .select('*, document_type:document_types(*), currency_type:currency_types(*), establishment:establishments(*)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return data as Claim;
  }

  async getByCode(code: string): Promise<Claim | null> {
    const { data, error } = await this.supabase
      .from('claims')
      .select('*, document_type:document_types(*), currency_type:currency_types(*), establishment:establishments(*)')
      .eq('claim_code', code)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return data as Claim;
  }

  async listByCompany(
    profileId: string,
    filters: { page: number; limit: number; state?: string; search?: string }
  ): Promise<{ data: Claim[]; count: number }> {
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;

    let query = this.supabase
      .from('claims')
      .select('*, document_type:document_types(*), currency_type:currency_types(*), establishment:establishments(*)', { count: 'exact' })
      .eq('profile_id', profileId)
      .is('deleted_at', null);

    if (filters.state) {
      query = query.eq('state', filters.state);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,claim_code.ilike.%${filters.search}%,document_number.ilike.%${filters.search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching claims:', error);
      return { data: [], count: 0 };
    }

    return {
      data: (data || []) as Claim[],
      count: count || 0,
    };
  }

  async create(data: ClaimInsertInput): Promise<Claim> {
    const { data: created, error } = await this.supabase
      .from('claims')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create claim: ${error.message}`);
    }

    return created as Claim;
  }

  async update(id: string, data: ClaimUpdateInput): Promise<Claim> {
    const { data: updated, error } = await this.supabase
      .from('claims')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update claim: ${error.message}`);
    }

    return updated as Claim;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('claims')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting claim:', error);
      return false;
    }
    return true;
  }
}
