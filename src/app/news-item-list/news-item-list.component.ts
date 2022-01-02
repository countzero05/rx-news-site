import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NewsItemApiService } from "../services/news-item.api.service";
import { NewsDataModel, NewsItemModel, NewsItemModelTemplate } from "../models/news-item.model";
import { merge, Observable, Subject, Subscription, takeUntil, timer } from "rxjs";
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
  private disableSubject$ = new Subject<{ newsData: NewsDataModel<NewsItemModelTemplate>, itemId: number }>();
  private timerSubscription$?: Subscription;
  private newsSubscription$?: Subscription;

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

    this.createNewsObservable();
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
    }

    this.newsItemDataService.reorderCurrentCategoryNewsItems( item.id, newsItems[secondIndex].id );
  }

  refreshData() {
    this.newsItemDataService.fetchCurrentCategoryNews( this.currentNewsCategoryId, true );
  }

  private createNewsObservable( force = false ) {
    this.newsObservable$ = merge(
      this.newsItemDataService.getCategoryNews( this.currentNewsCategoryId, force ).pipe(
        map( newsData => this.disableExpiredNews( newsData ) ),
      ),
      this.getDisableObservable()
    ).pipe(
      tap( ( newsData ) => this.createSubscriptionToDisableItem( newsData ) ),
      map( newsData => ( {
          ...newsData, newsItems: newsData.newsItems.map( item =>
            newsData.reorderedIds?.includes( item.id ) ? { ...item, reordered: true } : item
          )
        } )
      ),
      share(),
      takeUntil( this.destroyed$ )
    );

    this.newsSubscription$ = this.newsObservable$.subscribe( newsData => {
      this.newsData = newsData;
    } );
  }

  private createSubscriptionToDisableItem( newsData: NewsDataModel<NewsItemModelTemplate> ) {
    if ( this.timerSubscription$ && !this.timerSubscription$.closed ) {
      console.log( 'unsubscribe based on new data incoming' );
      this.timerSubscription$.unsubscribe();
      this.timerSubscription$ = undefined;
    }

    // check if something still exists to disable
    // if nothing do not run timer
    if ( !newsData.newsItems.some( item => !item.disabled ) ) {
      console.info( 'there is no more items to disable' );
      return;
    }

    // find out timer interval to check item to be disabled based on some extra logic
    const timerInterval = 3000 + ~~( Math.random() * 5000 );

    this.timerSubscription$ = timer( timerInterval )
      .subscribe( () => {
        // find out some item id to disabled by some extra logic
        const itemsToDisable = newsData.newsItems.filter( item => !item.disabled );
        const itemToDisableIndex = ~~( Math.random() * ( itemsToDisable.length - 1 ) );
        const itemId = itemsToDisable[itemToDisableIndex].id;
        this.disableSubject$.next( { newsData, itemId } );
      } )
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

  private getDisableObservable(): Observable<NewsDataModel<NewsItemModelTemplate>> {
    return this.disableSubject$.pipe(
      tap( () => {
        console.log( 'disable observable requested' );
      } ),
      map( ( { newsData, itemId } ) => {
        const itemIndex = newsData.newsItems.findIndex( item => item.id === itemId );
        newsData.newsItems[itemIndex] = { ...newsData.newsItems[itemIndex], disabled: true };
        return { ...newsData, reorderedIds: [] };
      } ),
      share()
    );
  }
}
