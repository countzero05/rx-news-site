import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from "@angular/common/http";
import { NewsItemComponent } from './news-item/news-item.component';
import { NewsItemListComponent } from './news-item-list/news-item-list.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { HeaderComponent } from './header/header.component';
import { NewsWrapperComponent } from './news-wrapper/news-wrapper.component';

@NgModule( {
  declarations: [
    AppComponent,
    NewsItemComponent,
    NewsItemListComponent,
    LandingPageComponent,
    HeaderComponent,
    NewsWrapperComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [ AppComponent ]
} )
export class AppModule {
}
