export interface NewsItemModel {
  id: number;
  title: string;
  description: string;
  reordered?: boolean;
}

export interface NewsItemModelTemplate extends NewsItemModel {
  disabled?: boolean;
}

export interface NewsDataModel<T> {
  id: number;
  title: string;
  newsItems: T[];
  reorderedIds?: Array<number>
}
