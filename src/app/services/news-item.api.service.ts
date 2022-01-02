import { Injectable } from '@angular/core';
// import { lorem as fakerLorem, name as fakerName } from 'faker';
import { NewsDataModel, NewsItemModel } from "../models/news-item.model";
import { Observable, take, tap, timer } from "rxjs";
import { map } from "rxjs/operators";
import * as chance from 'chance';

const itemsCount = 10;
const chanceInstance = chance.Chance();

@Injectable( {
  providedIn: 'root'
} )
export class NewsItemApiService {
  newsData: NewsDataModel<NewsItemModel> = {
    newsItems: [],
    title: '',
    id: 0
  };

  fetchRequested = 0;

  constructor() {
    this.newsData.title = chanceInstance.sentence({words: 5});

    for ( let i = 0; i < itemsCount; i++ ) {
      this.newsData.newsItems.push( {
        id: i + 1,
        title: chanceInstance.sentence({words: 5}),
        description: chanceInstance.paragraph({ sentences: 2 })
      } )
    }
  }

  getNewsItems( id: number ): Observable<NewsDataModel<NewsItemModel>> {
    return this.createObservableResponse( id ).pipe(
      tap( () => {
        console.log( 'fetch requested' );
      } ),
    );
  }

  reorderItems( id: number, id1: number, id2: number ): Observable<NewsDataModel<NewsItemModel>> {
    const item1Index = this.newsData.newsItems.findIndex( item => item.id === id1 );
    const item2Index = this.newsData.newsItems.findIndex( item => item.id === id2 );

    const item1 = this.newsData.newsItems[item1Index];
    const item2 = this.newsData.newsItems[item2Index];

    if ( item1 && item2 ) {
      this.newsData.newsItems[item1Index] = item2;
      this.newsData.newsItems[item2Index] = item1;
    }

    this.newsData = {
      ...this.newsData,
      newsItems: this.newsData.newsItems.map( newsItem => ( { ...newsItem } ) )
    };

    return this.createObservableResponse( id ).pipe(
      tap( () => {
        console.log( 'reorder requested' );
      } ),
    );
  }

  private createObservableResponse( id: number ): Observable<NewsDataModel<NewsItemModel>> {
    this.fetchRequested++;
    return timer( Math.random() * 10 )
      .pipe(
        tap( () => {
          console.log( 'server requested' );
        } ),
        take( 1 ),
        map( () => ( {
          newsItems: this.newsData.newsItems.map(item => ({...item})),
          id,
          title: `${this.newsData.title} (requested ${this.fetchRequested} times)` } ) )
      );
  }
}
