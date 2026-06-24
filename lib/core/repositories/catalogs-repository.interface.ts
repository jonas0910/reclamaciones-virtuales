import { DocumentType, CurrencyType } from '@/lib/core/entities/catalog';

export interface ICatalogsRepository {
  getDocumentTypes(): Promise<DocumentType[]>;
  getCurrencyTypes(): Promise<CurrencyType[]>;
}
