import { Establishment } from '@/lib/core/entities/establishment';

export interface IEstablishmentsRepository {
  getById(id: string): Promise<Establishment | null>;
  getBySlug(profileId: string, slug: string): Promise<Establishment | null>;
  listByCompany(profileId: string): Promise<Establishment[]>;
  create(data: Omit<Establishment, 'id' | 'created_at' | 'updated_at'>): Promise<Establishment>;
  update(id: string, data: Partial<Establishment>): Promise<Establishment>;
  delete(id: string): Promise<boolean>;
}
