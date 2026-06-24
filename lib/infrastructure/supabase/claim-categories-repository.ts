import { SupabaseClient } from "@supabase/supabase-js";
import { ClaimCategory } from "@/lib/core/entities/claim-category";
import { IClaimCategoriesRepository } from "@/lib/core/repositories/claim-categories-repository.interface";

export class SupabaseClaimCategoriesRepository implements IClaimCategoriesRepository {
  constructor(private client: SupabaseClient) {}

  async getByProfile(profileId: string): Promise<ClaimCategory[]> {
    const { data, error } = await this.client
      .from("claim_categories")
      .select("*")
      .eq("profile_id", profileId)
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<ClaimCategory | null> {
    const { data, error } = await this.client
      .from("claim_categories")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(category: Omit<ClaimCategory, "id" | "created_at">): Promise<ClaimCategory> {
    const { data, error } = await this.client
      .from("claim_categories")
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("claim_categories")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async update(id: string, category: Partial<Omit<ClaimCategory, "id" | "created_at">>): Promise<ClaimCategory> {
    const { data, error } = await this.client
      .from("claim_categories")
      .update(category)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
