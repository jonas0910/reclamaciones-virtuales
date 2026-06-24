export interface ClaimCategory {
  id: string;
  profile_id: string;
  establishment_id?: string | null;
  name: string;
  created_at: string;
  deleted_at?: string | null;
}
