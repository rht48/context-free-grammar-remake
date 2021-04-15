import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import { HomeRoutingModule } from './home.routing.module';
import { HomePage } from './home.page';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfigGrammarComponent } from './components/config-grammar/config-grammar.component';

import { ModalModule } from 'ngx-bootstrap/modal';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CalcGrammarComponent } from './components/calc-grammar/calc-grammar.component';
import { TableComponent } from './components/table/table.component';
import { ParseComponent } from './components/parse/parse.component';
import { TreeComponent } from './components/tree/tree.component';
import { NonTerminalsComponent } from './components/non-terminals/non-terminals.component';
import { TermsComponent } from './components/terms/terms.component';
import { RulesComponent } from './components/rules/rules.component';
import { NumberedRulesComponent } from './components/numbered-rules/numbered-rules.component';

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    ModalModule.forRoot(),
    AccordionModule.forRoot(),
    BsDropdownModule.forRoot(),
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    HomePage,
    ConfigGrammarComponent,
    CalcGrammarComponent,
    TableComponent,
    ParseComponent,
    TreeComponent,
    NonTerminalsComponent,
    TermsComponent,
    RulesComponent,
    NumberedRulesComponent
  ]
})
export class HomeModule {
}
