import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewsItemListComponent } from "./news-item-list/news-item-list.component";
import { LandingPageComponent } from "./landing-page/landing-page.component";
import { NewsWrapperComponent } from "./news-wrapper/news-wrapper.component";

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  {
    path: 'news/:newsCategoryId/data', component: NewsWrapperComponent, children: [
      { path: '', component: NewsItemListComponent }
    ]
  },
];

@NgModule( {
  imports: [ RouterModule.forRoot( routes ) ],
  exports: [ RouterModule ]
} )
export class AppRoutingModule {
}
