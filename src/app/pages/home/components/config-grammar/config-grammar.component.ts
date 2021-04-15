import { Component, OnInit, Output, Pipe, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Grammar, Production } from 'src/app/models/grammar';
import { CalculationsService } from '../../services/calculations.service';
import { GrammarService } from '../../services/grammar.service';
import { ShowGrammarService } from '../../services/show-grammar.service';

@Component({
  selector: 'app-config-grammar',
  templateUrl: './config-grammar.component.html',
  styleUrls: ['./config-grammar.component.scss']
})
export class ConfigGrammarComponent implements OnInit {

  @Output() public grammar: Grammar;

  constructor(public modalService: BsModalService,
              public grammarService: GrammarService,
              public calculationsService: CalculationsService,
              public showGrammarService: ShowGrammarService) { }

  ngOnInit(): void {
    this.grammar = new Grammar({}, '');
  }

  public parse(input: string): void {
    const lines = input.split('\n');
    let id = 1;
    let rules = {};
    let entryPoint: string;
    for(const line of lines) {
      const separated = line.split(' -> ');
      if(separated.length === 2) {
        const nonTerminal = separated[0];
        if(id === 1) {
          entryPoint = nonTerminal;
        }
        const productions = separated[1].split(' | ');
        for(const p of productions) {
          const terms = p.split(' ');
          const production = new Production(id++, terms);
          if(Object.keys(rules).indexOf(nonTerminal) < 0) {
            rules[nonTerminal] = [];
          }
          rules[nonTerminal].push(production);
        }
      }
    }
    // this.grammar.setRules(rules, entryPoint);
    this.grammar = new Grammar(rules, entryPoint);
  }

  // openModal(template: TemplateRef<any>): void {
  //   // Show the modal
  //   this.modalRef = this.modalService.show(template);
  // }

  // hideModal(): void {
  //   this.modalRef.hide();
  // }

  // saveGrammar(): void {
  //   const grammar = this.grammarService.getGrammar();
  //   this.hideModal();
  //   this.calculationsService.setGrammar(grammar);
  //   this.calculationsService.calculateNull();
  //   this.calculationsService.calculateFirst();
  //   this.calculationsService.calculateFollow();
  //   this.calculationsService.calculateLLTable();
  //   this.grammarService.setGrammar(new Grammar());
  // }

  // parse(input: string): void {
  //   this.grammarService.parse(input);
  // }

  
}
