import { Establishment } from "./establishment";

export interface SelectionPage {
  id: string;
  profile_id: string;
  custom_link: string; // Slug unique e.g., "grupo-nona"
  brand_name?: string | null;
  logo_url?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Relations
  establishments?: Establishment[];
}
