import { createTokenForReference } from '@angular/compiler/src/identifiers';
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
  public nullable(terms: string[]): boolean {
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
  public firstsArray(terms: string[]): string[] {
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

  /**
   * Creates a graph based on the inputs & prediction table
   * @param input 
   */
  public getGraph(input: string[]): Node[] {
    // Initializes a bunch of stuff like the stack, list of nodes (which is the graph)
    // Root nodes have undefined parents
    let nodes: Node[] = [];
    let id = 0;
    let pointer = 0;
    let entryNode = new Node(undefined, id++, this.grammar.getEntryPoint());
    let stack: Node[] = [entryNode];

    // While we are not finished reading the input, continue
    while(pointer < input.length) {
      
      // Get the first element of the stack
      const node: Node = stack.shift();

      // Get the current term to read
      const term = input[pointer];

      // Check if the current node is undefined that means that the stack is empty
      // There are 2 cases, either we are at the end, or there are more stuff to read
      // The first case is the normal case, just return the graph, we are finished
      // Else the input is not in the language
      if(node === undefined) {
        if(term !== Grammar.EOF) {
          nodes.push(new Node(undefined, id++, "Error language"));
        }
        return nodes;
      }

      // Push the node from the stack to the graph (node != undefined)
      nodes.push(node);
      
      // Check if the value of the node is a non terminal or not
      if(this.grammar.isNonTerminal(node.text)) {

        // Here, we check a bunch of stuff, if the term exist in the prediction table
        // We check how many rules are in the cell (term, non terminal)
        if(Object.keys(this.predictionTable).indexOf(term) < 0) {
          const n = new Node(node, id++, `Term ${term} not found`);
          node.addChild(n);
          nodes.push(n);
          return nodes;
        }

        const ruleIds = this.predictionTable[term][node.text];
        if(ruleIds.length === 0) {
          const n = new Node(node, id++, `Input not in language: no (${term}, ${node.text})`);
          node.addChild(n);
          nodes.push(n);
          return nodes;
        }


        if(ruleIds.length > 1) {
          const n = new Node(node, id++, `Multiple rules for (${term}, ${node.text})`);
          node.addChild(n);
          nodes.push(n);
          return nodes;
        }

        // If we pass all the tests, then we can proceed reading
        // Get the rule associated with the id
        // Then get all the terms inside of the rule and add them to the stack
        const production = this.grammar.getRuleById(ruleIds[0]);
        const terms = production.getTerms();
        let childNodes: Node[] = [];
        for(const t of terms) {
          const n = new Node(node, id++, t);
          node.addChild(n);
          childNodes.push(n);
        }
        stack = childNodes.concat(stack);
      }else {

        // The term is a terminal, so check if they match, if so, move the pointer to the next element
        // Else, check if it is epsilon, if not then we have a problem.
        if(node.text === term) {
          pointer++;
        }else if(node.text !== Grammar.EPSILON) {
          const n = new Node(node, id++, `Expected ${term} but found ${node.text}`);
          node.addChild(n);
          nodes.push(n);
          return nodes;
        }
      }
    }

    return nodes;
  }

  /**
   * Transforms the graph into mermaid language to show
   * @param nodes 
   */
  public getTree(nodes: Node[]): string {
    let res = 'graph TB;\n';

    for(const node of nodes) {
      // Create the tree from the root node
      if(node.parent === undefined) {
        res += this.createTree(node);
      }
    }

    // Makes all the links between the nodes
    res += this.makeLinks(nodes);

    // Changes the style of the subgraphs 
    res += this.makeStyle(nodes);

    return res;
  }

  /**
   * Create the tree from a node
   * @param node 
   */
  private createTree(node: Node): string {
    let res = `subgraph ${node.hash()}\n`;
    const text = node.text === Grammar.EPSILON ? '??' : node.text;
    res += `${node.id}("${text}")\n`;
    for(const child of node.children) {
      res += this.createTree(child);
    }
    res += `end\n`;
    return res;
  }

  /**
   * Make all the links
   * @param nodes 
   */
  private makeLinks(nodes: Node[]): string {
    let res = '';
    for(const node of nodes) {
      for(const child of node.children) {
        res += `${node.id}-->${child.id}\n`;
      }
    }
    return res;
  }

  /**
   * Changes the style of the subgraph
   * @param nodes 
   */
  private makeStyle(nodes: Node[]): string {
    let res = '';
    for(const node of nodes) {
      res += `style ${node.hash()} fill:#fff,stroke:#fff,stroke-width:4px,color:#fff\n`;
    }
    return res;
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
