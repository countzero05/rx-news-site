import { NewsDataModel, NewsItemModel } from "../models/news-item.model";

export interface NewsItemModelTemplate extends NewsItemModel {
  disabled?: boolean;
  highlight?: boolean;
}

export interface NewsDataModelTemplate extends NewsDataModel {
  newsItems: NewsItemModelTemplate[];
  lastReorderedIds?: Array<number>;
  lastDeleted?: number;
}
