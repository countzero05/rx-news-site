import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NewsDataModelTemplate, NewsItemModelTemplate } from "./new-item-template.model";
import { Observable, Subject, takeUntil } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { NewsItemListService } from "./news-item-list.service";
import { NewsItemDataService } from "../services/news-item.data.service";

@Component( {
  selector: 'app-news-item-list',
  templateUrl: './news-item-list.component.html',
  styleUrls: [ './news-item-list.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class NewsItemListComponent implements OnInit, OnDestroy {
  newsObservable$?: Observable<NewsDataModelTemplate>;
  private newsData?: NewsDataModelTemplate;
  private destroyed$ = new Subject();

  private currentNewsCategoryId!: number;

  constructor(
    private newsItemDataService: NewsItemDataService,
    private newsItemListService: NewsItemListService,
    private activatedRoute: ActivatedRoute
  ) {
    const currentNewsCategoryId = this.activatedRoute.snapshot.paramMap.get( 'newsCategoryId' );

    if ( !currentNewsCategoryId ) {
      console.error( 'there is no newsCategoryIdId' );
      return;
    }

    this.currentNewsCategoryId = +currentNewsCategoryId;

    this.newsObservable$ = this.newsItemListService
      .createNewsObservable( this.currentNewsCategoryId )
      .pipe( takeUntil( this.destroyed$ ) );

    this.newsObservable$.subscribe( newsData => {
      this.newsData = newsData;
    } );
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroyed$.next( true );
    this.destroyed$.complete();
  }

  reorderItem( { item, direction }: { item: NewsItemModelTemplate, direction: string } ): void {
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

    this.newsItemListService.reorderNewsItems( item.id, newsItems[secondIndex].id );
  }

  deleteItem( { item }: { item: NewsItemModelTemplate } ): void {
    this.newsItemListService.deleteNewsItem( item.id );
  }

  refreshData() {
    this.newsItemDataService.getCachedNews( this.currentNewsCategoryId, true );
  }
}
