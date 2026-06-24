import { SupabaseClient } from '@supabase/supabase-js';
import { ICatalogsRepository } from '@/lib/core/repositories/catalogs-repository.interface';
import { DocumentType, CurrencyType } from '@/lib/core/entities/catalog';

export class SupabaseCatalogsRepository implements ICatalogsRepository {
  constructor(private supabase: SupabaseClient) {}

  async getDocumentTypes(): Promise<DocumentType[]> {
    const { data, error } = await this.supabase
      .from('document_types')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching document types:', error);
      return [];
    }
    return data as DocumentType[];
  }

  async getCurrencyTypes(): Promise<CurrencyType[]> {
    const { data, error } = await this.supabase
      .from('currency_types')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching currency types:', error);
      return [];
    }
    return data as CurrencyType[];
  }
}
