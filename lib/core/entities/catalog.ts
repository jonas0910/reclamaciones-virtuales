export interface DocumentType {
  id: number;
  abbreviation: string;
  character_count: number;
  name: string;
  is_active: boolean;
}

export interface CurrencyType {
  id: number;
  abbreviation: string;
  name: string;
  symbol: string;
  is_active: boolean;
}
