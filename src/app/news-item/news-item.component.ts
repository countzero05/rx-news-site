import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NewsItemModel, NewsItemModelTemplate } from "../models/news-item.model";
import { animate, transition, trigger } from "@angular/animations";

@Component( {
  selector: 'app-news-item',
  templateUrl: './news-item.component.html',
  styleUrls: [ './news-item.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger( 'highlightTrigger', [
        transition( 'void => true', [ animate( '5s' ) ] )
      ]
    )
  ]
} )
export class NewsItemComponent implements OnInit, OnDestroy {

  @Input() item?: NewsItemModelTemplate;
  @Output() reorderItem = new EventEmitter<{ item: NewsItemModelTemplate, direction: string }>();
  @Output() deleteItem = new EventEmitter<{ item: NewsItemModelTemplate }>();
  highlight = false;

  constructor() {
  }

  ngOnInit(): void {
    this.highlight = !!this.item?.highlight;
  }

  ngOnDestroy() {
    // console.log('destroyed', this.item);
  }

  reorderClickHandler( item: NewsItemModel, direction: string ): void {
    this.reorderItem.emit( { item, direction } );
  }

  deleteClickHandler( item: NewsItemModel ): void {
    this.deleteItem.emit( { item } );
  }

  doneAnimation() {
    this.highlight = false;
  }

}
