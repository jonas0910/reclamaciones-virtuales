import { Establishment } from "./establishment";

export interface NotificationEmail {
  id: string;
  profile_id: string;
  establishment_id: string;
  email: string;
  verified: boolean;
  verification_token?: string | null;
  created_at: string;
  deleted_at?: string | null;

  // Relations
  establishment?: Establishment;
}
