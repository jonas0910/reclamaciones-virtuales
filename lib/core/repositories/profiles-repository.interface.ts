import { Profile } from '@/lib/core/entities/profile';

export interface IProfilesRepository {
  getById(id: string): Promise<Profile | null>;
  update(id: string, data: Partial<Profile>): Promise<Profile>;
}
