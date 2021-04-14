
export class Grammar {

    private entrypoint: string;
    private alphabet: string[];
    private nonterminals: string[];
    private rules: Rule[];
    private indexed_rules = {};

    public static EPSILON = 'epsilon';
    public static EOF = 'eof';

    constructor() {
        this.entrypoint = "";
        this.alphabet = [];
        this.nonterminals = [];
        this.rules = [];
     }

    setEntryPoint(entrypoint: string): void {
        this.entrypoint = entrypoint;
    }

    getEntryPoint(): string {
        return this.entrypoint;
    }

    setAlphabet(alphabet: string[]): void {
        this.alphabet = alphabet;
    }

    addToAlphabet(letter: string): void {
        if(!this.isAlphabet(letter)) {
            this.alphabet.push(letter);
        }
    }

    isAlphabet(input: string): boolean {
        return this.alphabet.indexOf(input) !== -1;
    }

    getAlphabet(): string[] {
        return this.alphabet;
    }

    setNonTerminals(nonterminals: string[]): void {
        this.nonterminals = nonterminals;
    }

    addNonTerminal(nonterminal: string): void {
        if(!this.isNonTerminal(nonterminal)) {
            this.nonterminals.push(nonterminal);
        }
    }

    getNonTerminals(): string[] {
        return this.nonterminals;
    }

    isNonTerminal(input: string): boolean {
        return this.nonterminals.indexOf(input) !== -1;
    }

    setRules(rules: Rule[]): void {
        this.rules = rules;
    }

    addRule(rule: Rule): void {
        if(!this.rules.find(r => r.getNonTerminal() === rule.getNonTerminal() && 
                            JSON.stringify(r.getProduction().getTerms()) === JSON.stringify(rule.getProduction().getTerms()))) {
            this.rules.push(rule);
            if(Object.keys(this.indexed_rules).indexOf(rule.getNonTerminal()) === -1) {
                this.indexed_rules[rule.getNonTerminal()] = [];
            }
            this.indexed_rules[rule.getNonTerminal()].push(rule);
        }
    }

    getRule(id: number): Rule {
        for(const rule of this.rules) {
            if(rule.getId() === id) {
                return rule;
            }
        }
        return undefined;
    }

    getRules(): Rule[] {
        return this.rules;
    }

    getIndexedRules() {
        return this.indexed_rules;
    }

}

export class Rule {

    private id: number;
    private nonterminal: string;
    private production: Production;

    constructor() {
        this.id = -1;
        this.nonterminal = "";
        this.production = new Production();
    }

    setId(id: number): void {
        this.id = id;
    }

    getId(): number {
        return this.id;
    }

    setNonTerminal(nt: string): void {
        this.nonterminal = nt;
    }

    getNonTerminal(): string {
        return this.nonterminal;
    }

    setProduction(production: Production): void {
        this.production = production;
    }

    getProduction(): Production {
        return this.production;
    }

}

export class Production {
    private terms: string[];

    constructor() {
        this.terms = [];
     }

    setTerms(terms: string[]): void {
        this.terms = terms;
    }

    addTerm(term: string): void {
        this.terms.push(term);
    }

    getTerms(): string[] {
        return this.terms;
    }
}