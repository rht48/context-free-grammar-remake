import {NgModule} from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplatePage } from './template.page';

const routes: Routes = [
  {
    path: '',
    component: TemplatePage
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule
  ]
})
export class TemplateRoutingModule {
}
