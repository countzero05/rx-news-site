export interface NewsItemModel {
  id: number;
  title: string;
  description: string;
}

export interface NewsItemModelTemplate extends NewsItemModel {
  disabled?: boolean;
}

export interface NewsDataModel<T> {
  id: number;
  title: string;
  newsItems: T[];
}
