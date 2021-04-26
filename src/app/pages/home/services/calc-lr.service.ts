import { Injectable } from '@angular/core';
import { Grammar, Production } from 'src/app/models/grammar';
import { Rule, State } from 'src/app/models/state';
import * as _ from 'lodash';
import { CalcLlService } from './calc-ll.service';
import { findReadVarNames } from '@angular/compiler/src/output/output_ast';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CalcLrService {

  private grammar: Grammar;
  private automaton: State[] = []

  // Syntax for parser table: {state: number (id of the state), {term: string, action: string[]}}
  private parserTable = {};

  // Action to do if there are multiple values
  // Syntax : {state: number (ide if the state), {term: string, action: string}}
  private action = {}

  constructor(private calcLlService: CalcLlService) { }

  public calculateLr(grammar: Grammar): void {
    const newGrammar = this.checkGrammar(grammar);
    this.calculateAutomaton(newGrammar);
    this.calculateParserTable(newGrammar);
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

  /**
   * Calculate the automaton lr1
   * @param grammar 
   */
  private calculateAutomaton(grammar: Grammar): void {
    // Reset the automaton
    this.automaton = [];
    let id = 0;

    // Define the entry state and apply closure to it
    const entryState = new State(id++, undefined);
    const entryTerm = grammar.getEntryPoint();
    const productions = grammar.getRulesOf(entryTerm);
    const production = productions[0];
    let rule = new Rule(production.getId(), entryTerm, production.getTerms());
    rule.addFollow(Grammar.EOF);
    entryState.addRule(rule);

    this.closure(grammar, entryState);
    this.mergeRules(entryState);

    // Init the stack and loop until the stack is empty, here we have fifo
    let stack: State[] = [entryState];
    while(stack.length > 0) {
      // Get the current state, push it to the automaton and get the transitions
      const state = stack.shift();
      this.automaton.push(state);
      const transitions = this.getTransitions(state);

      // For each transition, we create a new state based off the transition (and the rules affected by the transition)
      for(const transition of transitions) {
        const rules = state.getRulesContaining(transition);
        const newState = new State(id++, state);
        const clonedRules: Rule[] = _.cloneDeep(rules);

        // Advance the pointer by 1
        for(let r of clonedRules) {
          r.nextPointer();
          newState.addRule(r);
        }

        // Apply closure
        this.closure(grammar, newState);
        this.mergeRules(newState);

        // Check if the state is currently present, if not, add it to the stack and bind the parent/child
        // Else just do the binding
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
          const rule = new Rule(production.getId(), term, production.getTerms());
          
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

  /**
   * Merges rules together (for the follow)
   * @param state 
   */
  private mergeRules(state: State): void {
    let newRules: Rule[] = [];
    let visitedIndex: number[] = [];
    
    // Pretty simple
    // For each rule, check if there are other similar rules
    // If there is a similar rule then append the follows to the base rule
    // Mark both rules as visited so that we don't redo the calculations later
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

  /**
   * Get the outgoing transitions of a state
   * @param state 
   */
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

  public calculateParserTable(grammar: Grammar): void {
    // Reset the table
    this.parserTable = {};

    // Loop on every state
    for(const state of this.automaton) {

      // Initialise the table (row)
      this.parserTable[state.id] = {};
      for(const term of grammar.getTerms()) {
        this.parserTable[state.id][term] = [];
      }
      this.parserTable[state.id][Grammar.EOF] = [];
      for(const term of grammar.getNonTerminals()) {
        this.parserTable[state.id][term] = [];
      }

      // Here we loop on every transition
      // If the transition is a non terminal, then we goto that state
      // Else we shift to the state
      for(const child of state.children) {
        if(grammar.isNonTerminal(child.transition)) {
          this.parserTable[state.id][child.transition].push(child.child.id);
        }else {
          this.parserTable[state.id][child.transition].push(`s${child.child.id}`);
        }
      }

      // Here we handle the reduce
      // Loop on  each rule of the state and test if the pointer is out of bounds (or we have epsilon)
      // If so, for each follow, we add a reduce for that rule
      // Acceptiong states are that we have EOF and the non terminal is the entry point
      for(const rule of state.rules) {
        if(rule.pointer >= rule.terms.length || (rule.pointer === 0 && rule.terms.length === 1 && rule.terms[0] === Grammar.EPSILON)) {
          for(const follow of rule.follows) {
            if(follow === Grammar.EOF && rule.nonTerminal === grammar.getEntryPoint()) {
              this.parserTable[state.id][follow].push(`acc`);
            }else {
              this.parserTable[state.id][follow].push(`r${rule.id}`);
            }
          }
        }
      }
    }
  }

  public setAction(row: number, column: string, action: string): void {
    this.action[row] = {};
    this.action[row][column] = action;
  }

  public getParserTable(): {} {
    return this.parserTable;
  }

  /**
   * Transforms the automaton into mermaid like syntax
   */
  public getAutomatonString(): string {

    // I don't want to bother explainign what this does, it just works
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

  public verify(input: string[]): {} {
    let res = {};
    res["Step"] = [];
    res["Stack"] = [];
    res["Input"] = [];
    res["Action"] = [];

    let stepNumber = 1;
    let stack: any[] = [0];
    let strings = _.cloneDeep(input);
    let finished = false;
    
    while(!finished) {
      res["Step"].push(stepNumber++);
      res["Stack"].push(stack);
      res["Input"].push(strings);

      stack = _.cloneDeep(stack);
      strings = _.cloneDeep(strings);

      const finalElement = stack[stack.length - 1];
      const firstInput = strings[0];
      if(typeof finalElement === 'number') {
        const actions = this.parserTable[finalElement][firstInput];
        let action: string;

        if(actions.length === 0) {
          res["Action"].push(`No action found for ${finalElement}, ${firstInput}`);
          return res;
        }else if(actions.length === 1) {
          action = actions[0];
        }else {
          if(this.action[finalElement] !== undefined) {
            action = this.action[finalElement][firstInput];
          }else {
            action = actions[0];
          }
        }

        res["Action"].push(action);
        if(action === "acc") {
          finished = true;
          return res;
        }else if(action.startsWith('s')) {
          const stateNumber = +action.substring(1);
          stack.push(firstInput);
          stack.push(stateNumber);
          strings.shift();
        }else if(action.startsWith('r')) {
          const ruleId = +action.substring(1);
          const production = this.grammar.getRuleById(ruleId);
          const nonTerminal = this.grammar.getNonTerminalOfRuleId(ruleId);
          const terms = production.getTerms();
          
          if(terms.length >= 1 && terms[0] !== Grammar.EPSILON) {
            let pointer = terms.length - 1;
            while(pointer >= 0) {
              const last = stack.pop();
              if(last === terms[pointer]) {
                pointer --;
              }
            }
          }

          stack.push(nonTerminal);
        }
      }else {
        const secondToLast = stack[stack.length - 2];
        const actions = this.parserTable[secondToLast][finalElement];
        if(actions.length === 0) {
          res["Action"].push(`No action found for ${secondToLast}, ${finalElement}`);
          return res;
        }else {
          const action = actions[0];
          res["Action"].push(action);
          stack.push(action);
        }
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
