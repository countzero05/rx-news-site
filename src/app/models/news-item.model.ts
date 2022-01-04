export interface NewsItemModel {
  id: number;
  title: string;
  description: string;
  deleted?: boolean;
}

export interface NewsDataModel {
  id: number;
  title: string;
  newsItems: NewsItemModel[];
}
