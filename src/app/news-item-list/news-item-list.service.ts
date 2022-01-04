import { Injectable } from '@angular/core';
import { NewsItemDataService } from "../services/news-item.data.service";
import { filter, mapTo, merge, Observable, Subject, switchMap, timer } from "rxjs";
import { NewsDataModelTemplate, NewsItemModelTemplate } from './new-item-template.model';
import { map, share, tap } from "rxjs/operators";


const couldHighlight = ( newsData: NewsDataModelTemplate, item: NewsItemModelTemplate ) => {
  return newsData.lastReorderedIds?.includes( item.id ) || newsData.lastDeleted === item.id;
}

@Injectable( {
  providedIn: 'root'
} )
export class NewsItemListService {
  private reorderSubject$ = new Subject<[ id1: number, id2: number ]>();
  private deleteSubject$ = new Subject<number>();
  private expireSubject$ = new Subject<{ newsData: NewsDataModelTemplate, itemId: number }>();

  constructor( private newItemDataService: NewsItemDataService ) {
  }

  private get expiredObservable$(): Observable<NewsDataModelTemplate> {
    return this.expireSubject$.pipe(
      tap( () => {
        console.log( 'expired observable requested' );
      } ),
      map( ( { newsData, itemId } ) => {
        const itemIndex = newsData.newsItems.findIndex( item => item.id === itemId );
        newsData.newsItems[itemIndex] = { ...newsData.newsItems[itemIndex], disabled: true };
        return newsData;
      } )
    );
  }

  reorderNewsItems( id1: number, id2: number ) {
    this.reorderSubject$.next( [ id1, id2 ] );
  }

  deleteNewsItem( id: number ) {
    this.deleteSubject$.next( id );
  }

  createNewsObservable( categoryId: number ): Observable<NewsDataModelTemplate> {
    const baseObservable$ = merge(
      this.getNewsWithExpired( categoryId ),
      this.expiredObservable$
    ).pipe(
      share(),
    )

    return <Observable<NewsDataModelTemplate>>merge(
      baseObservable$
        .pipe(
          map( this.highlightItems.bind( this ) ),
        ),
      baseObservable$
        .pipe(
          switchMap( this.createExpireTimer.bind( this ) ),
          mapTo( undefined )
        )
    ).pipe( filter( ( newsData ) => !!newsData ) );
  }

  private getCategoryNews( categoryId: number, force = false ): Observable<NewsDataModelTemplate> {
    return merge(
      this.newItemDataService.getCachedNews( categoryId, force ),
      this.getCategoryReorderedNews( categoryId ),
      this.getCategoryDeletedNews( categoryId )
    );
  }

  private getCategoryReorderedNews( categoryId: number ): Observable<NewsDataModelTemplate> {
    return this.reorderSubject$.pipe(
      switchMap( ( identifiers ) => this.newItemDataService.reorderNews( categoryId, identifiers[0], identifiers[1] )
        .pipe(
          map( newsData => ( { ...newsData, lastReorderedIds: [ ...identifiers ] } ) ),
        )
      ),
      tap( () => {
        console.log( 'reorder observable requested' );
      } ),
    );
  }

  private getCategoryDeletedNews( categoryId: number ): Observable<NewsDataModelTemplate> {
    return this.deleteSubject$.pipe(
      switchMap( ( identifier ) => this.newItemDataService.deleteNews( categoryId, identifier )
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

  private getNewsWithExpired( categoryId: number ): Observable<NewsDataModelTemplate> {
    return this.getCategoryNews( categoryId )
      .pipe(
        map( this.disableExpiredNews.bind( this ) ),
      );
  }

  // her we will disable news items by some extra logic
  private disableExpiredNews( newsData: NewsDataModelTemplate ): NewsDataModelTemplate {
    return {
      ...newsData,
      newsItems: newsData.newsItems.map( ( newsItem, index ) => ( {
        ...newsItem,
        disabled: index > newsData.newsItems.length * 0.6
      } ) )
    }
  }

  private createExpireTimer( newsData: NewsDataModelTemplate ) {
    const timerInterval = 3000 + ~~( Math.random() * 5000 );
    return timer( timerInterval ).pipe(
      tap( () => {
        if ( !newsData.newsItems.some( item => !item.disabled ) ) {
          console.info( 'there is no more items to expire' );
          return;
        }
        const itemsToExpire = newsData.newsItems.filter( item => !item.disabled );
        const itemToExpireIndex = ~~( Math.random() * ( itemsToExpire.length - 1 ) );
        const itemId = itemsToExpire[itemToExpireIndex].id;
        this.expireSubject$.next( { newsData, itemId } );
      } ),
    )
  }

  private highlightItems( newsData: NewsDataModelTemplate ) {
    return ( {
      ...newsData,
      newsItems: newsData.newsItems.map( item => {
          item.highlight = couldHighlight( newsData, item );
          return item;
        }
      )
    } );
  }
}
