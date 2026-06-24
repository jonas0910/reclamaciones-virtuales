import { NotificationEmail } from "../entities/notification-email";

export interface INotificationEmailsRepository {
  getByEstablishment(establishmentId: string): Promise<NotificationEmail[]>;
  getByProfile(profileId: string): Promise<NotificationEmail[]>;
  create(email: Omit<NotificationEmail, "id" | "verified" | "verification_token" | "created_at">): Promise<NotificationEmail>;
  verifyToken(token: string): Promise<boolean>;
  delete(id: string): Promise<void>;
}
