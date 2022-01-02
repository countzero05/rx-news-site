import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NewsItemModel, NewsItemModelTemplate } from "../models/news-item.model";
import { animate, transition, trigger } from "@angular/animations";

@Component( {
  selector: 'app-news-item',
  templateUrl: './news-item.component.html',
  styleUrls: [ './news-item.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger( 'reorderedTrigger', [
        transition( 'void => true', [ animate( '5s' ) ] )
      ]
    )
  ]
} )
export class NewsItemComponent implements OnInit, OnDestroy {

  @Input() item?: NewsItemModelTemplate;
  @Output() reorderItem = new EventEmitter<{ item: NewsItemModelTemplate, direction: string }>();
  reordered = false;

  constructor() {
  }

  ngOnInit(): void {
    this.reordered = !!this.item?.reordered;
  }

  ngOnDestroy() {
    // console.log('destroyed', this.item);
  }

  clickHandler( item: NewsItemModel, direction: string ): void {
    this.reorderItem.emit( { item, direction } );
  }

  doneAnimation() {
    this.reordered = false;
  }

}
