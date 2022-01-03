import { Injectable } from '@angular/core';
import { merge, Observable, shareReplay, Subject, switchMap } from "rxjs";
import { NewsDataModel, NewsItemModel, NewsItemModelTemplate } from "../models/news-item.model";
import { map, tap } from "rxjs/operators";
import { NewsItemApiService } from "./news-item.api.service";

@Injectable( {
  providedIn: 'root'
} )
export class NewsItemDataService {
  private reorderSubject$ = new Subject<[ id1: number, id2: number ]>();
  private deleteSubject$ = new Subject<number>();

  private newsSubject = new Subject<NewsDataModel<NewsItemModel>>();
  private newsSubjectObservable = this.newsSubject.asObservable().pipe(
    shareReplay( { refCount: true, bufferSize: 1 } ),
  )

  private categoryId?: number;

  constructor(
    private newsItemApiService: NewsItemApiService ) {
  }

  fetchCategoryNews( categoryId: number, force = false ): Observable<NewsDataModel<NewsItemModel>> {
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

  getCategoryReorderedNews( categoryId: number ): Observable<NewsDataModel<NewsItemModel>> {
    return this.reorderSubject$.pipe(
      switchMap( ( identifiers ) => this.newsItemApiService.reorderItems( categoryId, identifiers[0], identifiers[1] )
        .pipe(
          map( newsData => {
            return { ...newsData, lastReorderedIds: [ ...identifiers ] }
          } ),
        ) ),
      tap( () => {
        console.log( 'reorder observable requested' );
      } ),
    );
  }

  getCategoryDeletedNews( categoryId: number ): Observable<NewsDataModel<NewsItemModel>> {
    return this.deleteSubject$.pipe(
      switchMap( ( identifier ) => this.newsItemApiService.deleteItem( categoryId, identifier )
        .pipe(
          map( newsData => {
            return { ...newsData, lastDeleted: identifier }
          } ),
        ) ),
      tap( () => {
        console.log( 'delete observable requested' );
      } ),
    );
  }

  getCategoryNews( categoryId: number, force = false ): Observable<NewsDataModel<NewsItemModelTemplate>> {
    return merge(
      this.fetchCategoryNews( categoryId, force ),
      this.getCategoryReorderedNews( categoryId ),
      this.getCategoryDeletedNews( categoryId )
    );
  }

  reorderNewsItems( id1: number, id2: number ) {
    this.reorderSubject$.next( [ id1, id2 ] );
  }

  deleteNewsItem( id: number ) {
    this.deleteSubject$.next( id );
  }

  private couldUseCache( force: boolean, categoryId: number ) {
    return !force && this.categoryId === categoryId;
  }
}
