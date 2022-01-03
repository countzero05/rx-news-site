import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NewsItemApiService } from "../services/news-item.api.service";
import { NewsDataModel, NewsItemModel, NewsItemModelTemplate } from "../models/news-item.model";
import { merge, Observable, Subject, switchMap, takeUntil, timer } from "rxjs";
import { map, share, tap } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { NewsItemDataService } from "../services/news-item.data.service";

@Component( {
  selector: 'app-news-item-list',
  templateUrl: './news-item-list.component.html',
  styleUrls: [ './news-item-list.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class NewsItemListComponent implements OnInit, OnDestroy {
  newsObservable$?: Observable<NewsDataModel<NewsItemModelTemplate>>;
  private newsData?: NewsDataModel<NewsItemModelTemplate>;
  private destroyed$ = new Subject();
  private expireSubject$ = new Subject<{ newsData: NewsDataModel<NewsItemModelTemplate>, itemId: number }>();

  private currentNewsCategoryId!: number;

  constructor(
    private newsItemApiService: NewsItemApiService,
    private newsItemDataService: NewsItemDataService,
    private activatedRoute: ActivatedRoute
  ) {
    const currentNewsCategoryId = this.activatedRoute.snapshot.paramMap.get( 'newsCategoryId' );

    if ( !currentNewsCategoryId ) {
      console.error( 'there is no newsCategoryIdId' );
      return;
    }

    this.currentNewsCategoryId = +currentNewsCategoryId;

    this.newsObservable$ = this.createNewsObservable();

    this.newsObservable$.subscribe( newsData => {
      this.newsData = newsData;
    } );
  }

  private get expiredObservable$(): Observable<NewsDataModel<NewsItemModelTemplate>> {
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

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroyed$.next( true );
    this.destroyed$.complete();
  }

  reorderItem( { item, direction }: { item: NewsItemModel, direction: string } ): void {
    if ( !this.newsData ) {
      return;
    }
    const { newsItems } = this.newsData;
    const itemIndex = newsItems.findIndex( ( { id } ) => id === item.id );
    const secondIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;

    if ( secondIndex < 0 || secondIndex >= newsItems.length ) {
      console.error( 'Wrong item to reorder' );
      return;
    }

    this.newsItemDataService.reorderNewsItems( item.id, newsItems[secondIndex].id );
  }

  deleteItem( { item }: { item: NewsItemModel } ): void {
    this.newsItemDataService.deleteNewsItem( item.id );
  }

  refreshData() {
    this.newsItemDataService.fetchCategoryNews( this.currentNewsCategoryId, true );
  }

  private createNewsObservable() {
    const baseObservable$ = merge(
      this.newsItemDataService.getCategoryNews( this.currentNewsCategoryId )
        .pipe(
          map( this.disableExpiredNews.bind( this ) ),
        ),
      this.expiredObservable$
    ).pipe(
      share(),
    )

    baseObservable$
      .pipe(
        takeUntil( this.destroyed$ ),
        switchMap( this.createExpireTimer.bind( this ) )
      ).subscribe();

    return baseObservable$
      .pipe(
        takeUntil( this.destroyed$ ),
        map( this.highlightItems.bind( this ) ),
      );
  }

  private createExpireTimer( newsData: NewsDataModel<NewsItemModelTemplate> ) {
    const timerInterval = 3000 + ~~( Math.random() * 5000 );
    return timer( timerInterval ).pipe(
      takeUntil( this.destroyed$ ),
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

  private highlightItems( newsData: NewsDataModel<NewsItemModelTemplate> ) {
    return ( {
      ...newsData,
      newsItems: newsData.newsItems.map( item => {
          item.highlight = this.couldHighlight( newsData, item );
          return item;
        }
      )
    } );
  }

  private couldHighlight( newsData: NewsDataModel<NewsItemModelTemplate>, item: NewsItemModelTemplate ) {
    return newsData.lastReorderedIds?.includes( item.id ) || newsData.lastDeleted === item.id;
  }

  // her we will disable news items by some extra logic
  private disableExpiredNews( newsData: NewsDataModel<NewsItemModel> ): NewsDataModel<NewsItemModelTemplate> {
    return {
      ...newsData,
      newsItems: newsData.newsItems.map( ( newsItem, index ) => ( {
        ...newsItem,
        disabled: index > newsData.newsItems.length * 0.6
      } ) )
    }
  }
}
