import { Component, OnInit } from '@angular/core';
import { NewsItemDataService } from "../services/news-item.data.service";
import { NewsDataModel, NewsItemModel } from "../models/news-item.model";
import { Observable } from "rxjs";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  constructor() {
  }

  ngOnInit(): void {
  }

}
