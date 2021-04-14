import { Injectable } from '@angular/core';
import { Grammar, Production, Rule } from 'src/app/models/grammar';

@Injectable({
  providedIn: 'root'
})
export class GrammarService {

  grammar: Grammar = new Grammar();

  constructor() { }

  parse(input: string): void {
    this.grammar = new Grammar();
    const lines = input.split('\n');
    const first = lines[0].split(' -> ');
    if(first.length > 1) {
      this.grammar.setEntryPoint(first[0]);
    }
    let right = [];
    let counter = 1;
    for(const line of lines) {
      const separated = line.split(' -> ');
      if(separated.length > 1) {
        const nonterminal = separated[0];
        const rules = separated[1];
        this.grammar.addNonTerminal(nonterminal);
        for(const r of rules.split(' | ')) {
          let rule = new Rule();
          rule.setId(counter++);
          let production = new Production();
          rule.setNonTerminal(nonterminal);
          let elements = r.split(' ');
          // if(nonterminal === this.grammar.getEntryPoint()) {
          //   if(elements.indexOf(Grammar.EOF) === -1) {
          //     elements.push(Grammar.EOF);
          //   }
          // }
          right = right.concat(elements);
          for(const element of elements) {
            production.addTerm(element);
          }
          rule.setProduction(production);
          this.grammar.addRule(rule);
        }
      }
    }

    for(const r of right) {
      if(r !== '' && !this.grammar.isNonTerminal(r)) {
        if(r !== Grammar.EPSILON) {
          this.grammar.addToAlphabet(r);
        }
      }
    }
  }

  getGrammar(): Grammar {
    return this.grammar;
  }

  setGrammar(grammar: Grammar): void {
    this.grammar = grammar;
  }
  
}
