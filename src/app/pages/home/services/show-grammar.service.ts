import { Injectable } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Grammar } from 'src/app/models/grammar';

@Injectable({
  providedIn: 'root'
})
export class ShowGrammarService {

  constructor() { }

  getEntryPoint(grammar: Grammar): string {
    if(grammar.getEntryPoint() !== '') {
      return grammar.getEntryPoint();
    }else {
      return 'None';
    }
  }

  getNonTerminals(grammar: Grammar): string {
    if(grammar.getNonTerminals().length > 0) {
      return '{' + grammar.getNonTerminals().join(', ') + '}';
    }else{
      return '&empty;';
    }
  }

  getAlphabet(grammar: Grammar): string {
    if(grammar.getAlphabet().length > 0) {
      return '{' + grammar.getAlphabet().join(', ')  + '}';
    }else {
      return '&empty;';
    }
  }

  getRules(grammar: Grammar): string {
    if(grammar.getRules().length > 0) {
      let str = "";
      
      let rules = {};
      for(const rule of grammar.getRules()) {
        const nonterminal = rule.getNonTerminal();
        if(Object.keys(rules).indexOf(nonterminal) === -1) {
          rules[nonterminal] = [];
        }
        rules[nonterminal].push(rule.getProduction());
      }

      str += '<ul>';
      for(const nonterminal of Object.keys(rules)) {
        str += '<li>';
        str += nonterminal + " &xrarr; ";
        for(let i = 0; i < rules[nonterminal].length; i++) {
          const rule = rules[nonterminal][i];
          const terms = rule.getTerms();
          if(terms.length === 1 && terms[0] === Grammar.EPSILON) {
            str += '&epsilon;'
          }else {
            str += rule.getTerms().join(' ');
          }
          if(i < rules[nonterminal].length - 1) {
            str += ' | ';
          }
        }
        str += '</li>';
      }
      str += '</ul>';
      return str;
    }else {
      return '&empty;';
    }
  }

  getNumberedRules(grammar: Grammar): string {
    if(grammar.getRules().length > 0) {
      let str = '';
      for(const rule of grammar.getRules()) {
        const terms = rule.getProduction().getTerms();
        str += '(' + rule.getId() + ')  ' + rule.getNonTerminal() + ' &xrarr; '
        if(terms.length === 1 && terms[0] === Grammar.EPSILON) {
          str += '&epsilon;'
        }else {
          str += terms.join(' ');
        }
        str += '<br/>';
      }
      return str;
    }else {
      return '&empty;';
    }
  }
}
