import { Claim, ClaimInsertInput, ClaimUpdateInput } from '@/lib/core/entities/claim';

export interface IClaimsRepository {
  getById(id: string): Promise<Claim | null>;
  getByCode(code: string): Promise<Claim | null>;
  listByCompany(
    profileId: string,
    filters: { page: number; limit: number; state?: string; search?: string }
  ): Promise<{ data: Claim[]; count: number }>;
  create(data: ClaimInsertInput): Promise<Claim>;
  update(id: string, data: ClaimUpdateInput): Promise<Claim>;
  delete(id: string): Promise<boolean>;
}
