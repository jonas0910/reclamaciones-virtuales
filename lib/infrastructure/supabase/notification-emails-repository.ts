import { SupabaseClient } from "@supabase/supabase-js";
import { NotificationEmail } from "@/lib/core/entities/notification-email";
import { INotificationEmailsRepository } from "@/lib/core/repositories/notification-emails-repository.interface";

export class SupabaseNotificationEmailsRepository implements INotificationEmailsRepository {
  constructor(private client: SupabaseClient) {}

  async getByEstablishment(establishmentId: string): Promise<NotificationEmail[]> {
    const { data, error } = await this.client
      .from("notification_emails")
      .select("*, establishment:establishments(*)")
      .eq("establishment_id", establishmentId)
      .is("deleted_at", null);

    if (error) throw error;
    return data || [];
  }

  async getByProfile(profileId: string): Promise<NotificationEmail[]> {
    const { data, error } = await this.client
      .from("notification_emails")
      .select("*, establishment:establishments(*)")
      .eq("profile_id", profileId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async create(email: Omit<NotificationEmail, "id" | "verified" | "verification_token" | "created_at">): Promise<NotificationEmail> {
    const token = crypto.randomUUID();
    const { data, error } = await this.client
      .from("notification_emails")
      .insert({
        ...email,
        verified: false,
        verification_token: token,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async verifyToken(token: string): Promise<boolean> {
    const { data, error } = await this.client
      .from("notification_emails")
      .update({ verified: true, verification_token: null })
      .eq("verification_token", token)
      .select();

    if (error) throw error;
    return (data || []).length > 0;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("notification_emails")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}
