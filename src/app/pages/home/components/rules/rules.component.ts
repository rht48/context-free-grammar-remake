import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Grammar } from 'src/app/models/grammar';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit {

  @Input()
  public grammar: Grammar;

  public text = 'Rules:<br/>';

  constructor() { }

  ngOnInit(): void {
    this.grammar = new Grammar({}, '');
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reset the text
    this.text = 'Rules:<br/>';
    // Get all the nonterminals, useful for getting productions later
    const nonTerminals = this.grammar.getNonTerminals();

    // Each rule has the form <nonterminal> → <prod1> | <prod2>
    for(const nonTerminal of nonTerminals) {
      this.text += nonTerminal + ' → ';

      // Get all productions for the current non terminal
      const productions = this.grammar.getRulesOf(nonTerminal);
      for(let i = 0; i < productions.length; i++) {
        const production = productions[i];

        // Get the terms that are 'beautiful'
        this.text += production.getNiceTerms().join(' ');

        // We don't want to append | when we are at the end
        if(i !== productions.length - 1) {
          this.text += ' | ';
        }
      }
      this.text += '<br/>';
    }
  }
}
