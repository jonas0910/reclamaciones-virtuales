import { SelectionPage } from "../entities/selection-page";

export interface ISelectionPagesRepository {
  getByProfile(profileId: string): Promise<SelectionPage[]>;
  getBySlug(slug: string): Promise<SelectionPage | null>;
  create(page: Omit<SelectionPage, "id" | "created_at" | "updated_at">, establishmentIds: string[]): Promise<SelectionPage>;
  update(id: string, page: Partial<Omit<SelectionPage, "id" | "created_at" | "updated_at">>, establishmentIds?: string[]): Promise<SelectionPage>;
  delete(id: string): Promise<void>;
}
