export interface Establishment {
  id: string;
  profile_id: string;
  name: string;
  custom_link: string;
  type_address: 'Fisico' | 'Virtual';
  code?: string | null;
  address?: string | null;
  department?: string | null;
  province?: string | null;
  district?: string | null;
  zip_code?: string | null;
  web_page?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}
