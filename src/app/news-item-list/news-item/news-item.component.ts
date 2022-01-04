import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { animate, transition, trigger } from "@angular/animations";
import { NewsItemModelTemplate } from "../new-item-template.model";

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

  reorderClickHandler( item: NewsItemModelTemplate, direction: string ): void {
    this.reorderItem.emit( { item, direction } );
  }

  deleteClickHandler( item: NewsItemModelTemplate ): void {
    this.deleteItem.emit( { item } );
  }

  doneAnimation() {
    this.highlight = false;
  }

}
