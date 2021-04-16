import { Injectable } from '@angular/core';
import { Grammar } from 'src/app/models/grammar';

@Injectable({
  providedIn: 'root'
})
export class CalcLlService {

  // Null table will contain Non terminal, then a list representing the column and each value is a "square" in the table
  private nullTable = {};
  private nulls = {};

  // 2 dimensions because each "square" can contain multiple strings
  private firstTable = {};
  private firsts = {};

  private followTable = {};
  private follows = {};

  private predictionTable = {};


  constructor() { }

  public calculateLL(grammar: Grammar): void {
    this.calculateNull(grammar);
    this.calculateFirst(grammar);
    this.calculateFollow(grammar);
    this.calculatePredict(grammar);
  }

  public getNullTable(): {} {
    return this.nullTable;
  }

  public getFirstTable(): {} {
    return this.firstTable;
  }

  public getFollowTable(): {} {
    return this.followTable;
  }

  private calculateNull(grammar: Grammar): void {
    // Reset the values
    this.nullTable = {};
    this.nulls = {};

    // For each non terminal of the grammar, create a column and add 0 to the first row;
    for(const nt of grammar.getNonTerminals()) {
      this.nullTable[nt] = [0];
    }

    // Index represents the index of the last FULL row
    let index = 0;

    // Loop until we haven't changed
    do {
      for(const nt of grammar.getNonTerminals()) {
        // If a non terminal is at 1, it will stay at 1 for the rest of the algorithm
        if(this.nullTable[nt][index] === 1) {
          this.nullTable[nt].push(1);
        }else {
          let changed = false;
          const productions = grammar.getRulesOf(nt);

          // Check all the productions for the current non terminal
          // No need to loop if there has been a change
          for(let i = 0; i < productions.length && !changed; i++) {
            const terms = productions[i].getTerms();
            for(let j = 0; j < terms.length && !changed; j++) {
              const term = terms[j];

              // If we are at the end, check if it is an eof, epsilon or the last term is nullable
              // We only need to check the last term because we break the loop when we see a non terminal before
              if(j === terms.length - 1 && 
                ( term === Grammar.EPSILON || 
                  term === Grammar.EOF || 
                  (grammar.isNonTerminal(term) && this.nullTable[term][index] === 1))
                ) {
                changed = true;
                this.nullTable[nt].push(1);
              }
              
              // Check if the term is nullable or that it is a term, if so break, we do not need to check further
              if(!grammar.isNonTerminal(term) || this.nullTable[term][index] === 0) {
                break;
              }
            }
          }
          // Push 0 if we haven't broken before
          if(!changed) {
            this.nullTable[nt].push(0);
          }
        }
      }
      index++; 
    } while(this.hasChanged(this.nullTable) && index < 100); // The limit is so that it doesn't run forever

    // Put the last line of the table in nulls
    for(const nt of grammar.getNonTerminals()) {
      this.nulls[nt] = this.nullTable[nt][index];
    }
  }

  private calculateFirst(grammar: Grammar): void {
    // Reset the tables
    this.firstTable = {};
    this.firsts = {};

    // Set an empty array for each non terminal
    for(const nt of grammar.getNonTerminals()) {
      this.firstTable[nt] = [[]];
    }

    let index = 0;
    // loop while the table hasn't changed
    do {
      for(const nt of grammar.getNonTerminals()) {
        this.firstTable[nt].push([]);
        // Duplicate the line
        for(const term of this.firstTable[nt][index]) {
          this.firstTable[nt][index + 1].push(term);
        }

        const productions = grammar.getRulesOf(nt);
        // Get the first of each production
        for(const production of productions) {
          const terms = production.getTerms();
          for(const term of terms) {
            // If the term is a non terminal then push the term in the array
            if(!grammar.isNonTerminal(term)) {
              // We don't want to push epsilon
              if(term !== Grammar.EPSILON) {
                this.add(this.firstTable[nt][index + 1], term);
              }
              break;
            }

            // The term is a non terminal, so add all its firsts to the current array
            const f = this.firstTable[term][index];
            for(const t of f) {
              this.add(this.firstTable[nt][index + 1], t);
            }

            // Check if the non terminal is nullable
            // If so continue, else break
            if(this.nulls[term] === 0) {
              break;
            }
          }
        }
      }
      index ++;
    } while(this.hasChanged(this.firstTable) && index < 100);

    // Put the last line of the table in firsts
    for(const nt of grammar.getNonTerminals()) {
      this.firsts[nt] = this.firstTable[nt][index];
    }
  }

  private calculateFollow(grammar: Grammar): void {
    // Reset the tables
    this.followTable = {};
    this.follows = {};

    // Set an empty array for each non terminal
    for(const nt of grammar.getNonTerminals()) {
      this.followTable[nt] = [[]];
    }

    let index = 0;
    // loop while the table hasn't changed
    do {
      for(const nt of grammar.getNonTerminals()) {
        this.followTable[nt].push([]);
        // Duplicate the line
        for(const term of this.followTable[nt][index]) {
          this.followTable[nt][index + 1].push(term);
        }
        
        // Add eof to the entry point
        if(index === 0 && nt === grammar.getEntryPoint()) {
          this.followTable[nt][index + 1].push(Grammar.EOF);
        }
        
        // We need to look at all the terms in each production
        for(const nonterminal of grammar.getNonTerminals()) {
          for(const production of grammar.getRulesOf(nonterminal)) {
            const terms = production.getTerms();
            for(const term of terms) {
              if(term === nt) {

              }
            }
          }
        }
        
      }
      index ++;
    } while(this.hasChanged(this.followTable) && index < 100);

    // Put the last line of the table in firsts
    for(const nt of grammar.getNonTerminals()) {
      this.follows[nt] = this.followTable[nt][index];
    }
  }

  private calculatePredict(grammar: Grammar): void {

  }

  private hasChanged(table: {}): boolean {
    const keys = Object.keys(table);
    if(keys.length <= 0) {
      return true;
    }

    // Test each column
    for(const key of keys) {
      const value = table[key];
      const rows = value.length;

      // If there is at least 2 rows and the values are different, then the table has changed, end the loop
      if(rows >= 2 && JSON.stringify(value[rows - 1]) !== JSON.stringify(value[rows - 2])) {
        return true;
      }
    }

    return false;
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

  /**
   * Tests if a stream of terms can be null
   * @param terms 
   */
  private nullable(terms: string[]): boolean {
    if(terms.length === 0) {
      return true;
    }
    if(this.nulls[terms[0]] === 1) {
      return this.nullable(terms.slice(1));
    }
    return false;
  }

  private firstsArray(terms: string[]) {
    if(terms.length === 0) {
      return [];
    }
    const ft = terms[0];
    const rt = terms.slice(1);
    const first = this.firsts[ft];
    let rest = [];
    if(this.nullable(rt)) {
      rest = this.firstsArray(rt);
    }

    for(const elem of first) {
      this.add(rest, elem);
    }

    return rest;
  }
}

/*
S -> A B C
A -> a | D
B -> b | epsilon
C -> c | epsilon
D -> epsilon


S -> E $
E -> T E'
E' -> + T E' | - T E' | epsilon
T -> F T'
T' -> x F T' | / F T' | epsilon
F -> ( E ) | id
*/
