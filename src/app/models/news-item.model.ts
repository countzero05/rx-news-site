export interface NewsItemModel {
  id: number;
  title: string;
  description: string;
  highlight?: boolean;
  deleted?: boolean;
}

export interface NewsItemModelTemplate extends NewsItemModel {
  disabled?: boolean;
}

export interface NewsDataModel<T> {
  id: number;
  title: string;
  newsItems: T[];
  lastReorderedIds?: Array<number>;
  lastDeleted?: number;
}
