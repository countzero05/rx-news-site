import { Component, OnDestroy, OnInit } from '@angular/core';
import { NewsDataModel, NewsItemModel } from "../models/news-item.model";
import { Observable, Subject, Subscription, takeUntil, tap } from "rxjs";
import { NewsItemDataService } from "../services/news-item.data.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-news-wrapper',
  templateUrl: './news-wrapper.component.html',
  styleUrls: ['./news-wrapper.component.scss']
})
export class NewsWrapperComponent implements OnInit, OnDestroy {
  currentCategoryNewsObservable$: Observable<NewsDataModel<NewsItemModel>> = new Observable<NewsDataModel<NewsItemModel>>();
  destroy$ = new Subject();

  constructor(private newsItemDataService: NewsItemDataService, private activatedRoute: ActivatedRoute) {
    const currentNewsCategoryId = this.activatedRoute.snapshot.paramMap.get( 'newsCategoryId' );

    if ( !currentNewsCategoryId ) {
      console.error( 'there is no newsCategoryIdId' );
      return;
    }

    this.currentCategoryNewsObservable$ = this.newsItemDataService.fetchCurrentCategoryNews(+currentNewsCategoryId);

    this.currentCategoryNewsObservable$.pipe(takeUntil(this.destroy$)).subscribe(
      (newsData) => {
        console.log('fetch news data', newsData);

      })
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
