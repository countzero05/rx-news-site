import { TestBed } from '@angular/core/testing';

import { NewsItemListService } from './news-item-list.service';

describe( 'NewsItemListService', () => {
  let service: NewsItemListService;

  beforeEach( () => {
    TestBed.configureTestingModule( {} );
    service = TestBed.inject( NewsItemListService );
  } );

  it( 'should be created', () => {
    expect( service ).toBeTruthy();
  } );
} );
