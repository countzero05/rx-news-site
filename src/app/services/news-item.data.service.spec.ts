import { TestBed } from '@angular/core/testing';

import { NewsItemDataService } from './news-item.data.service';

describe('NewsItem.DataService', () => {
  let service: NewsItemDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewsItemDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
