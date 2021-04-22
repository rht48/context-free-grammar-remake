import { Injectable } from '@angular/core';
import { BrowserStack } from 'protractor/built/driverProviders';
import { Grammar } from 'src/app/models/grammar';
import { Node } from 'src/app/models/node';

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

  private grammar: Grammar;


  constructor() { }

  public calculateLL(grammar: Grammar): void {
    this.calculateNull(grammar);
    this.calculateFirst(grammar);
    this.calculateFollow(grammar);
    this.calculatePredict(grammar);
    this.grammar = grammar;
  }

  public getNullTable(): {} {
    return this.nullTable;
  }

  public getFirstTable(): {} {
    return this.firstTable;
  }

  public getPredictionTable(): {} {
    return this.predictionTable;
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
            let i = 0;
            for(const term of terms) {
              // Test if the current term is equal to the term in the rule
              // If so, we can then calculate the follow terms
              if(term === nt) {
                // Get the first elements of the rest of the rule
                const beta = terms.slice(i + 1);
                const betaFirsts = this.firstsArray(beta);
                
                // Add all firsts to the table
                for(const bf of betaFirsts) {
                  this.add(this.followTable[nt][index + 1], bf);
                }

                // Test if the rest is nullable, if so, we need to check the follow of the nonterminal of the current rule
                if(this.nullable(beta)) {
                  const followNonTerminal = this.followTable[nonterminal][index];

                  // Insert the follow in the table
                  for(const fnt of followNonTerminal) {
                    this.add(this.followTable[nt][index + 1], fnt);
                  }
                }
              }
              i++;
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
    this.predictionTable = {};
    const nonTerminals = grammar.getNonTerminals();
    let terms = grammar.getTerms();
    terms.push(Grammar.EOF);

    for(const term of terms) {
      this.predictionTable[term] = {};
      for(const nonTerminal of nonTerminals) {
        // Initialize empty array
        this.predictionTable[term][nonTerminal] = [];

        const rules = grammar.getRulesOf(nonTerminal);

        for(const rule of rules) {
          // Check that the term is in the firsts or in the follows if the terms can be null
          // If so, add the term to the array
          const betaFirsts = this.firstsArray(rule.getTerms());
          if(betaFirsts.indexOf(term) >= 0 || (this.nullable(rule.getTerms()) && this.follows[nonTerminal].indexOf(term) >= 0)) {
            this.add(this.predictionTable[term][nonTerminal], rule.getId());
          }
        }
      }
    }
  }

  /**
   * Tests if the last line changed from the before last line
   * @param table 
   */
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
    if(terms.length === 1 && terms[0] === Grammar.EPSILON) {
      return true;
    }
    if(this.nulls[terms[0]] === 1) {
      return this.nullable(terms.slice(1));
    }
    return false;
  }

  /**
   * Gets all the firsts terms from a list of terms
   * @param terms 
   */
  private firstsArray(terms: string[]) {
    if(terms.length === 0) {
      return [];
    }
    const ft = terms[0];
    const rt = terms.slice(1);
    
    let first = [];
    let res = [];
    if(ft !== Grammar.EPSILON) {
      if(Object.keys(this.firsts).indexOf(ft) < 0) {
        first = [ft];
      }else {
        first = this.firsts[ft];
        if(this.nulls[ft] === 1) {
          res = this.firstsArray(rt);
        }
      }
    }

    for(const elem of first) {
      this.add(res, elem);
    }

    return res;
  }


  public getGraph(input: string[]): Node[] {
    let index = 0;
    let graph = [];
    let id = 0;
    const entry = new Node(undefined, id++, this.grammar.getEntryPoint());
    graph.push(entry);
    let stack = [entry];
    // continue until we arrive at the end
    while(index < input.length) {
      const term = input[index];
      const first = stack.pop();

      if(first === undefined) {
        if(term !== Grammar.EOF) {
          graph.push(new Node(undefined, id++, "Error language"));
          return graph;
        }
        index ++;
      }else {

        // Check if the first element is a non terminal
        if(!this.grammar.isNonTerminal(first.text)) {
          // If the first elment of the statck is the same as the input
          // Then move to the next element
          // Else, it does not belong to the same language
          if(first.text === term) {
            // graph.push(new Node(first, id++, term));
            index ++;
          }else {
            graph.push(new Node(first, id++, "Error language"));
            return graph;
          }
        }else {

          // check if the term exists in the table
          if(Object.keys(this.predictionTable).indexOf(term) < 0) {
            graph.push(new Node(first, id++, "Term Not Found"));
            return graph;
          }

          const ruleIds = this.predictionTable[term][first.text];
          // Check if there is a rule, if not return
          if(ruleIds.length === 0) {
            graph.push(new Node(first, id++, "Error language"));
            return graph;
          }

          // check if there are multiple rules, if so, not ll(1)
          if(ruleIds.length >= 2) {
            graph.push(new Node(first, id++, "Multiple paths"));
            return graph;
          }
          // Get the production and add it to the stack
          const production = this.grammar.getRuleById(ruleIds[0]);
          const terms = production.getTerms();
          const finalId = terms.length + id;
          for(let i = terms.length - 1; i >= 0; i--) {
            const ident = id++;
            const node1 = new Node(first, ident, terms[i]);
            const node2 = new Node(first, finalId - (terms.length - i), terms[terms.length - i - 1]);
            graph.push(node2)
            if(terms[i] !== Grammar.EPSILON) {
              stack.push(node1);
            }
          }
        }
      }
    }
    return graph;
  }

  /**
   * Transforms the graph into mermaid syntax
   * @param graph 
   */
  public getTree(graph: Node[]): string {
    let res = 'graph TB;\n';
    let nodes = new Array(graph.length);
    for(const node of graph) {
      if(node.parent !== undefined) {
        nodes[node.id] = new NodeTree(node.id, node.parent.id, node.text);
        nodes[node.parent.id].children.push(node.id);
      }else {
        nodes[node.id] = new NodeTree(node.id, undefined, node.text);
      }
    }

    for(const node of nodes) {
      if(node.parent === undefined) {
        res += this.createTree(nodes, node);
        res += this.write(nodes, node);
        res += "style " + node.children.length + node.id + node.children.join('') + " fill:#fff,stroke:#fff,stroke-width:4px,color:#fff\n";
      }
    }
    return res;
  }

  public createTree(nodes: NodeTree[], node: NodeTree): string {
    let res = 'subgraph ' + node.children.length + node.id + node.children.join('') + '\n';
    const text = node.text === Grammar.EPSILON ? 'ε' : node.text;
    res += node.id + '("' + text + '")\n';
    for(const child of node.children) {
      res += this.createTree(nodes, nodes[child]);
    }
    res += 'end\n';
    return res;
  }

  public write(nodes: NodeTree[], node: NodeTree): string {
    let res = '';
    for(const child of node.children) {
      res += node.id + '-->' + nodes[child].id +'\n';
      
      res += "style " + nodes[child].children.length + nodes[child].id + nodes[child].children.join('') + " fill:#fff,stroke:#fff,stroke-width:4px,color:#fff\n";
      res += this.write(nodes, nodes[child]);
    }
    return res;
  }
}

class NodeTree {
  id: number;
  parent: number;
  children: number[] = [];
  text: string;
  constructor(id: number, parent: number, text: string) {
    this.id = id; 
    this.parent = parent;
    this.text = text;
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
