import { SupabaseClient } from "@supabase/supabase-js";
import { SelectionPage } from "@/lib/core/entities/selection-page";
import { ISelectionPagesRepository } from "@/lib/core/repositories/selection-pages-repository.interface";

export class SupabaseSelectionPagesRepository implements ISelectionPagesRepository {
  constructor(private client: SupabaseClient) {}

  async getByProfile(profileId: string): Promise<SelectionPage[]> {
    const { data, error } = await this.client
      .from("selection_pages")
      .select(`
        *,
        establishment_selection_pages(
          establishment:establishments(*)
        )
      `)
      .eq("profile_id", profileId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => {
      const ests = (row.establishment_selection_pages || [])
        .map((pivot: any) => pivot.establishment)
        .filter((e: any) => e && e.deleted_at === null);
      return {
        ...row,
        establishments: ests,
      };
    });
  }

  async getBySlug(slug: string): Promise<SelectionPage | null> {
    const { data, error } = await this.client
      .from("selection_pages")
      .select(`
        *,
        establishment_selection_pages(
          establishment:establishments(*)
        )
      `)
      .eq("custom_link", slug)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const ests = (data.establishment_selection_pages || [])
      .map((pivot: any) => pivot.establishment)
      .filter((e: any) => e && e.deleted_at === null);

    return {
      ...data,
      establishments: ests,
    };
  }

  async create(
    page: Omit<SelectionPage, "id" | "created_at" | "updated_at">,
    establishmentIds: string[]
  ): Promise<SelectionPage> {
    const { data: pageData, error: pageError } = await this.client
      .from("selection_pages")
      .insert(page)
      .select()
      .single();

    if (pageError) throw pageError;

    if (establishmentIds.length > 0) {
      const links = establishmentIds.map((estId) => ({
        selection_page_id: pageData.id,
        establishment_id: estId,
      }));

      const { error: linkError } = await this.client
        .from("establishment_selection_pages")
        .insert(links);

      if (linkError) throw linkError;
    }

    return pageData;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("selection_pages")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async update(
    id: string,
    page: Partial<Omit<SelectionPage, "id" | "created_at" | "updated_at">>,
    establishmentIds?: string[]
  ): Promise<SelectionPage> {
    const { data: pageData, error: pageError } = await this.client
      .from("selection_pages")
      .update(page)
      .eq("id", id)
      .select()
      .single();

    if (pageError) throw pageError;

    if (establishmentIds !== undefined) {
      // 1. Delete all existing associations
      const { error: deleteError } = await this.client
        .from("establishment_selection_pages")
        .delete()
        .eq("selection_page_id", id);

      if (deleteError) throw deleteError;

      // 2. Insert new associations
      if (establishmentIds.length > 0) {
        const links = establishmentIds.map((estId) => ({
          selection_page_id: id,
          establishment_id: estId,
        }));

        const { error: linkError } = await this.client
          .from("establishment_selection_pages")
          .insert(links);

        if (linkError) throw linkError;
      }
    }

    return pageData;
  }
}
