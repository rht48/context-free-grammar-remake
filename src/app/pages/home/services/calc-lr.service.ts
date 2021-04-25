import { Injectable } from '@angular/core';
import { Grammar, Production } from 'src/app/models/grammar';
import { Rule, State } from 'src/app/models/state';
import * as _ from 'lodash';
import { CalcLlService } from './calc-ll.service';

@Injectable({
  providedIn: 'root'
})
export class CalcLrService {

  private grammar: Grammar;
  private automaton: State[] = []

  constructor(private calcLlService: CalcLlService) { }

  public calculateLr(grammar: Grammar): void {
    const newGrammar = this.checkGrammar(grammar);
    this.calculateAutomaton(newGrammar);
    this.grammar = newGrammar;
  }

  private checkGrammar(grammar: Grammar): Grammar {
    let g: Grammar = _.cloneDeep(grammar);
    const entry = g.getEntryPoint();
    const productions = g.getRulesOf(entry);

    let flag = false;
    if(productions.length > 1) {
      flag = true;
      for(const production of productions) {
        let terms = production.getTerms();
        if(terms[terms.length - 1] === Grammar.EOF) {
          terms.pop();
        }
      }
    }else {
      const terms = productions[0].getTerms();
      if(terms[terms.length - 1] === Grammar.EOF) {
        terms.pop();
      }
    }

    if(flag) {
      const newEntry = `${entry}'`;
      const production = new Production(-1, [entry]);
      g.addRule(newEntry, [production]);
      g.setEntryPoint(newEntry);
    }
    return g;
  }

  private calculateAutomaton(grammar: Grammar): void {
    this.automaton = [];
    let id = 0;
    const entryState = new State(id++, undefined);
    const entryTerm = grammar.getEntryPoint();
    let rule = new Rule(entryTerm, grammar.getRulesOf(entryTerm)[0].getTerms());
    rule.addFollow(Grammar.EOF);
    entryState.addRule(rule);

    this.closure(grammar, entryState);
    this.mergeRules(entryState);

    let stack: State[] = [entryState];
    
    while(stack.length > 0) {
      const state = stack.shift();
      this.automaton.push(state);
      const transitions = this.getTransitions(state);

      for(const transition of transitions) {
        const rules = state.getRulesContaining(transition);
        const newState = new State(id++, state);
        const clonedRules: Rule[] = _.cloneDeep(rules);

        for(let r of clonedRules) {
          r.nextPointer();
          newState.addRule(r);
        }

        this.closure(grammar, newState);
        this.mergeRules(newState);

        const identState = this.automaton.filter(s => newState.equals(s));
        if(identState.length === 0) {
          const child = newState;
          state.addChild({transition, child});
          stack.push(child);
        }else {
          const child = identState[0];
          state.addChild({transition, child});
          id--;
        }
      }
    }
    console.log(this.automaton);
  }

  /**
   * Calculate the closure of a given state
   * @param grammar 
   * @param state 
   */
  private closure(grammar: Grammar, state: State): void {
    // Look at each rule, event those we have generated
    for(let i = 0; i < state.rules.length; i++) {
      // Ge the current rule & the term associated with the pointer
      let baseRule = state.rules[i];
      let term = baseRule.terms[baseRule.pointer];

      // If the term is a non terminal, then we generate all rules with the current non terminal
      if(grammar.isNonTerminal(term)) {
        
        // Get the rest of the list of terms
        const rest = baseRule.terms.slice(baseRule.pointer + 1);

        // Calculate the firsts & if it is nullable
        const firsts = this.calcLlService.firstsArray(rest);
        const nullable = this.calcLlService.nullable(rest);
        
        // Get all the productions associated with the non terminals
        for(const production of grammar.getRulesOf(term)) {
          const rule = new Rule(term, production.getTerms());
          
          // Add all the firsts to the follow
          for(const t of firsts) {
            rule.addFollow(t);
          }

          // Il the rest of the terms are nullable, then add the follows of the base rule
          if(nullable) {
            for(const t of baseRule.follows) {
              rule.addFollow(t);
            }
          }

          // Add the rule only if it doesn't exist, or else infinite loop !
          if(state.rules.filter(r => r.equals(rule)).length === 0) {
            state.addRule(rule);
          }
        }
      }
    }
  }

  private mergeRules(state: State): void {
    let newRules: Rule[] = [];
    let visitedIndex: number[] = [];
    
    for(let i = 0; i < state.rules.length; i++) {
      if(visitedIndex.indexOf(i) < 0) {
        const rule = state.rules[i];
        for(let j = i + 1; j < state.rules.length; j++) {
          if(visitedIndex.indexOf(j) < 0) {
            const r = state.rules[j];
            if(rule.productionEquals(r)) {
              visitedIndex.push(j);
              for(const t of r.follows) {
                this.add(rule.follows, t);
              }
            }
          }
        }
        newRules.push(rule);
      }
    }
    state.rules = newRules;
  }

  private getTransitions(state: State): string[] {
    let res: string[] = [];
    for(const rule of state.rules) {
      const term = rule.terms[rule.pointer];
      if(term !== undefined && term !== Grammar.EPSILON) {
        this.add(res, term);
      }
    }
    return res;
  }

  public getAutomatonString(): string {
    let res = 'stateDiagram-v2';
    for(const state of this.automaton) {
      res += `\ns${state.id}: S${state.id}`;
      for(const rule of state.rules) {
        let str = '';
        for(let i = 0; i < rule.terms.length; i++) {
          if(i === rule.pointer) {
            str += '•'
          }
          if(rule.terms[i] !== Grammar.EPSILON) {
            str += `${rule.terms[i]} `;
          }
        }
        if(rule.pointer >= rule.terms.length) {
          str += '•'
        }
        res += `<br/>${rule.nonTerminal} -> ${str}, ${rule.follows.join('|')}`;
      }
    }

    for(const state of this.automaton) {
      for(const link of state.children) {
        res += `\ns${state.id} --> s${link.child.id}: ${link.transition}`;
      }
    }
    return res;
  }

  /**
   * Adds an element to an array only if the array doesn't contain the item
   * @param array 
   * @param item 
   */
  private add(array: any[], item: any) {
    if(array.indexOf(item) === -1) {
      array.push(item);
    }
  }
}

/*
S -> E $
E -> E + E
E -> E * E
E -> id
*/
