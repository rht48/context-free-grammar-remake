import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Grammar } from 'src/app/models/grammar';

@Component({
  selector: 'app-numbered-rules',
  templateUrl: './numbered-rules.component.html',
  styleUrls: ['./numbered-rules.component.scss']
})
export class NumberedRulesComponent implements OnInit {

  @Input()
  public grammar: Grammar;

  public text = 'Numbered rules:<br/>';

  constructor() { }

  ngOnInit(): void {
    this.grammar = new Grammar({}, '');
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reset the text
    this.text = 'Numbered rules:<br/>';
    // Get all the nonterminals, useful for getting productions later
    const nonTerminals = this.grammar.getNonTerminals();

    // Each rule has the form <nonterminal> → <prod1> | <prod2>
    for(const nonTerminal of nonTerminals) {
      // Get all productions for the current non terminal
      const productions = this.grammar.getRulesOf(nonTerminal);

      // For each production, append all the data needed
      for(let i = 0; i < productions.length; i++) {
        const production = productions[i];
        this.text += '(' + production.getId() + ')\t'
        this.text += nonTerminal + ' → ';  
        this.text += production.getNiceTerms().join(' ');
        this.text += '<br/>';
      }
    }
  }

}
