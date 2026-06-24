export interface Profile {
  id: string;
  name: string;
  company_ruc: string;
  company_name: string;
  company_address: string;
  company_postal_code?: string | null;
  company_link?: string | null;
  company_logo?: string | null;
  role: 'super_admin' | 'owner' | 'admin' | 'manager';
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}
