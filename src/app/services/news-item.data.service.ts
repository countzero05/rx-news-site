import { Injectable } from '@angular/core';
import { Observable, shareReplay, Subject } from "rxjs";
import { NewsDataModel } from "../models/news-item.model";
import { NewsItemApiService } from "./news-item.api.service";

@Injectable( {
  providedIn: 'root'
} )
export class NewsItemDataService {
  private newsSubject = new Subject<NewsDataModel>();
  private newsSubjectObservable = this.newsSubject.asObservable().pipe(
    shareReplay( { refCount: true, bufferSize: 1 } ),
  )

  private categoryId?: number;

  constructor(
    private newsItemApiService: NewsItemApiService ) {
  }

  getNews( categoryId: number ): Observable<NewsDataModel> {
    return this.newsItemApiService.getNewsItems( categoryId );
  }

  reorderNews( categoryId: number, id1: number, id2: number ): Observable<NewsDataModel> {
    return this.newsItemApiService.reorderItems( categoryId, id1, id2 )
  }

  deleteNews( categoryId: number, id: number ): Observable<NewsDataModel> {
    return this.newsItemApiService.deleteItem( categoryId, id );
  }

  getCachedNews( categoryId: number, refresh = false ): Observable<NewsDataModel> {
    if ( this.couldUseCache( refresh, categoryId ) ) {
      return this.newsSubjectObservable;
    }
    this.categoryId = categoryId;
    this.getNews( categoryId ).subscribe( ( newsData ) => {
      this.newsSubject.next( newsData );
    } );

    return this.newsSubjectObservable;
  }

  private couldUseCache( force: boolean, categoryId: number ) {
    return !force && this.categoryId === categoryId;
  }
}
