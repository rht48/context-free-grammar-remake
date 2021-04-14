import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { TemplateRoutingModule } from './template.routing.module';
import { TemplatePage } from './template.page';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    TemplateRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    TemplatePage
  ]
})
export class TemplateModule {
}
