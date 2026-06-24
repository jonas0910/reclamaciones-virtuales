import { ClaimCategory } from "../entities/claim-category";

export interface IClaimCategoriesRepository {
  getByProfile(profileId: string): Promise<ClaimCategory[]>;
  getById(id: string): Promise<ClaimCategory | null>;
  create(category: Omit<ClaimCategory, "id" | "created_at">): Promise<ClaimCategory>;
  update(id: string, category: Partial<Omit<ClaimCategory, "id" | "created_at">>): Promise<ClaimCategory>;
  delete(id: string): Promise<void>;
}
