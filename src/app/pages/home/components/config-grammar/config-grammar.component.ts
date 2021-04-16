import { Component, EventEmitter, OnInit, Output, Pipe, TemplateRef } from '@angular/core';
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

  public grammar: Grammar;

  @Output()
  public grammarEmitter = new EventEmitter<Grammar>();

  constructor(public modalService: BsModalService,
              public grammarService: GrammarService,
              public calculationsService: CalculationsService,
              public showGrammarService: ShowGrammarService) { }

  ngOnInit(): void {
    this.grammar = new Grammar({}, '');
  }

  public parse(input: string): void {
    // Split all the lines
    const lines = input.split('\n');

    // Start numbering ids at 1
    let id = 1;
    let rules = {};
    let entryPoint: string;

    // Read all the lines
    for(const line of lines) {
      // Separate terms from non terminal
      const separated = line.split(' -> ');
      if(separated.length === 2) {
        const nonTerminal = separated[0];

        // The entrypoint is the first non terminal of the list
        if(id === 1) {
          entryPoint = nonTerminal;
        }

        // Get all the productions and add them to the list of rules
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
    this.grammar = new Grammar(rules, entryPoint);
    this.grammarEmitter.emit(this.grammar);
  }
}
