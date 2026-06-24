import { DocumentType, CurrencyType } from './catalog';
import { Establishment } from './establishment';

export interface Claim {
  id: string;
  profile_id: string;
  establishment_id: string;
  name: string;
  under_age: boolean;
  parent_name?: string | null;
  document_type_id: number;
  document_number: string;
  email: string;
  phone: string;
  type_asset: 'Producto' | 'Servicio';
  description_asset: string;
  currency_type_id?: number | null;
  claim_amount?: number | null;
  claim_type: 'queja' | 'reclamo';
  claim_text: string;
  request_text: string;
  numeration?: number | null;
  claim_code?: string | null;
  state: 'pendiente' | 'respondido';
  answer?: string | null;
  answer_date?: string | null;
  email_contact_date?: string | null;
  phone_contact_date?: string | null;
  internal_notes?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Relations (optional loading)
  document_type?: DocumentType;
  currency_type?: CurrencyType;
  establishment?: Establishment;
}

export type ClaimInsertInput = Omit<Claim, 'id' | 'created_at' | 'updated_at' | 'numeration' | 'claim_code' | 'state'>;
export type ClaimUpdateInput = Partial<Pick<Claim, 'answer' | 'answer_date' | 'state' | 'internal_notes' | 'email_contact_date' | 'phone_contact_date'>>;
