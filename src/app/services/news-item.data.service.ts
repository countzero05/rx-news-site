import { Injectable } from '@angular/core';
import { merge, Observable, shareReplay, Subject, switchMap } from "rxjs";
import { NewsDataModel, NewsItemModel, NewsItemModelTemplate } from "../models/news-item.model";
import { concatMap, map, tap } from "rxjs/operators";
import { NewsItemApiService } from "./news-item.api.service";

@Injectable( {
  providedIn: 'root'
} )
export class NewsItemDataService {
  private reorderSubject$ = new Subject<[ id1: number, id2: number ]>();

  private newsSubject = new Subject<NewsDataModel<NewsItemModel>>();
  private newsSubjectObservable = this.newsSubject.asObservable().pipe(
    shareReplay( { refCount: true, bufferSize: 1 } ),
  )

  private categoryId?: number;

  constructor(
    private newsItemApiService: NewsItemApiService ) {
  }

  fetchCurrentCategoryNews( categoryId: number, force = false ): Observable<NewsDataModel<NewsItemModel>> {
    if ( this.couldUseCache( force, categoryId ) ) {
      return this.newsSubjectObservable;
    }
    this.categoryId = categoryId;
    this.newsItemApiService
      .getNewsItems( categoryId ).subscribe( ( newsData ) => {
      this.newsSubject.next( newsData );
    } );

    return this.newsSubjectObservable;
  }

  getCurrentCategoryReorderedNews( categoryId: number ): Observable<NewsDataModel<NewsItemModel>> {
    return this.reorderSubject$.pipe(
      switchMap( ( identifiers ) => this.newsItemApiService.reorderItems( categoryId, identifiers[0], identifiers[1] ).pipe(
        map(newsData => {
          return {...newsData, reorderedIds: [...identifiers]}
        }),
      ) ),
      tap( () => {
        console.log( 'reorder observable requested' );
      } ),
    );
  }

  getCategoryNews( categoryId: number, force = false ): Observable<NewsDataModel<NewsItemModelTemplate>> {
    return merge(
      this.fetchCurrentCategoryNews( categoryId, force ),
      this.getCurrentCategoryReorderedNews( categoryId )
    );
  }

  reorderCurrentCategoryNewsItems( id1: number, id2: number ) {
    this.reorderSubject$.next( [ id1, id2 ] );
  }

  private couldUseCache( force: boolean, categoryId: number ) {
    return !force && this.categoryId === categoryId;
  }
}
