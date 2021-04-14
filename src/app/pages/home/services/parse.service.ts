import { stripGeneratedFileSuffix } from '@angular/compiler/src/aot/util';
import { Injectable } from '@angular/core';
import { Grammar } from 'src/app/models/grammar';
import { CalculationsService } from './calculations.service';

@Injectable({
  providedIn: 'root'
})
export class ParseService {

  parsed: string[] = [];
  steps: string[] = [];
  stack_trace = {};
  entrypoint: string;
  graph: string = 'graph TB;'

  constructor(private calculationsService: CalculationsService) { }

  parse(input: string) {
    this.parsed = input.split(' ');
    if(this.parsed.indexOf(Grammar.EOF) === -1) {
      this.parsed.push(Grammar.EOF);
    }
    this.parsed = this.parsed.filter(element => element !== '');
  }

  getStringSteps(): string {
    return this.steps.join(' &xrarr; ')
  }

  getStringStack(): string {
    let str = '<ul>';
    let stack = [this.entrypoint];
    let first = true;
    for(const id of Object.keys(this.stack_trace)) {
      str += '<li>';
      str += this.parsed[id] + ": "
      str += '<b>' + stack.join(' ') + '</b>';
      str += ' ';
      for(const rule of this.stack_trace[id]) {
        if(rule !== undefined) {
          str += '(' + rule.getId() + ')';
          str += '&xrarr; '
          stack.shift();

          const terms = rule.getProduction().getTerms();
          if(!(terms.length === 1 && terms[0] === Grammar.EPSILON)) {
            stack = terms.concat(stack);
          }

          if(first && stack.indexOf(Grammar.EOF) === -1) {
            stack.push(Grammar.EOF);
            first = false;
          }
        }else {
          str += ' &xrarr; '
          str += 'Error';
          return str;
        }
        str += '<b>' + stack.join(' ') + '</b>';
        str += ' ';
      }
      stack.shift();
      str += '&xrarr; '
      if(stack.length > 0) {
        str += '<b>&otimes; ' + stack.join(' ') + '</b>';
      }else {
        str += "<i><b>ok</b></i>"
      }
      str += ' ';
      str += '</li>'
    }
    str += '</ul>'
    return str;
  }

  getParsed(): string {
    return this.parsed.join(' ');
  }

  verify(table, grammar: Grammar) {
    this.steps = [];
    this.stack_trace = [];
    this.entrypoint = grammar.getEntryPoint();
    let stack = [this.entrypoint];
    const text = this.parsed;
    let pointer = 0;

    let first = true;
    
    while(pointer < text.length) {
      let element = stack.shift();
      let letter = text[pointer];
      this.stack_trace[pointer] = [];
      if(letter !== Grammar.EOF && letter !== Grammar.EPSILON && grammar.getAlphabet().indexOf(letter) === -1) {
        this.steps.push("Error");
        this.stack_trace[pointer].push(undefined);
        return;
      } 
      while(letter !== element) {
        const id = table[letter][element];
      
        if(id === undefined) {
          this.steps.push("Error");
          this.stack_trace[pointer].push(undefined);
          return;
        }

        this.steps.push(id);
        const rule = grammar.getRule(id);
        this.stack_trace[pointer].push(rule);
        const terms = rule.getProduction().getTerms();
        if(!(terms.length === 1 && terms[0] === Grammar.EPSILON)) {
          stack = terms.concat(stack);
        }
        if(first && stack.indexOf(Grammar.EOF) === -1) {
          stack.push(Grammar.EOF);
          first = false;
        }

        element = stack.shift();
      }
      pointer ++;

    }
    this.updateGraph();
  }

  id = 0;
  updateGraph(): void {
    this.graph = 'graph TB;';
    const cloned_steps = JSON.parse(JSON.stringify(this.steps));
    const grammar = this.calculationsService.getGrammar();
    const entrypoint = grammar.getEntryPoint();
    this.id = 0;
    this.graph += this.id + '(("' + entrypoint + '"));';
    this.id ++;
    this.graph += this.createGraph(grammar, cloned_steps, grammar.getEntryPoint(), 0);
  }

  createGraph(grammar: Grammar, array: string[], parent: string, parent_id: number): string {
    if(array.length === 0) {
      return '';
    }
    let str = '';
    const step = +array[0];
    const rule = grammar.getRule(step);
    if(rule.getNonTerminal() !== parent) {
      return '';
    }
    array.shift();
    const terms = rule.getProduction().getTerms();
    for(const term of terms) {
      const t = term === Grammar.EPSILON ? '&epsilon;' : term;
      const current_id = ++this.id;
      str += parent_id + '-->' + current_id + '(("' + t + '"));';
      str += this.createGraph(grammar, array, term, current_id);
    }
    return str;
  }
}


class Node {
  id: number;
  name: string;
  children: Node[];
}