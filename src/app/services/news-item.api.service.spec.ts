import { TestBed } from '@angular/core/testing';

import { NewsItemApiService } from './news-item.api.service';

describe( 'NewsItemService', () => {
  let service: NewsItemApiService;

  beforeEach( () => {
    TestBed.configureTestingModule( {} );
    service = TestBed.inject( NewsItemApiService );
  } );

  it( 'should be created', () => {
    expect( service ).toBeTruthy();
  } );
} );
