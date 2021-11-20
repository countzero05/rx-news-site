import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NewsItemModel, NewsItemModelTemplate } from "../models/news-item.model";

@Component( {
  selector: 'app-news-item',
  templateUrl: './news-item.component.html',
  styleUrls: [ './news-item.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class NewsItemComponent implements OnInit {

  @Input() item?: NewsItemModelTemplate;
  @Output() reorderItem = new EventEmitter<{ item: NewsItemModelTemplate, direction: string }>();

  constructor() {
  }

  ngOnInit(): void {
  }

  clickHandler( item: NewsItemModel, direction: string ): void {
    this.reorderItem.emit( { item, direction } );
  }

}
