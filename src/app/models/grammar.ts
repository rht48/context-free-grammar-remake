export class Grammar {

    private rules = {};
    private nonTerminals: string[] = [];
    private terms: string[] = [];
    private entryPoint: string;

    public static EPSILON = 'epsilon';
    public static EOF = '$';

    constructor(rules, entryPoint) {
        this.setRules(rules, entryPoint);
    }

    private calculateNonTerminals(): void {
        // Non terminals are the keys
        this.nonTerminals = Object.keys(this.rules);
    }

    private calculateTerms(): void {
        // Loop on each rule, add terms when they are not non terminal and are not present in the terms array
        for(const nonTerminal of this.nonTerminals) {
            const productions: Production[] = this.rules[nonTerminal];
            for(const production of productions) {
                for(const term of production.getTerms()) {
                    // Check if the term is present, if it isn't a non terminal, and isn't a word defined above
                    if( this.nonTerminals.indexOf(term) < 0 && this.terms.indexOf(term) < 0 && 
                        term !== Grammar.EPSILON && term !== Grammar.EOF) {
                        this.terms.push(term);
                    }
                }
            }
        }
    }

    public getRules() {
        return this.rules;
    }

    public getRulesOf(nonTerminal: string): Production[] {
        if(this.nonTerminals.indexOf(nonTerminal) >= 0) {
            return this.rules[nonTerminal];
        }
        return [];
    }

    public getNonTerminals(): string[] {
        return this.nonTerminals;
    }

    public getTerms(): string[] {
        return this.terms;
    }

    public getEntryPoint(): string {
        return this.entryPoint;
    }

    public setRules(rules, entryPoint) {
        this.rules = rules;
        this.entryPoint = entryPoint;
        this.terms = [];
        this.nonTerminals = [];
        this.calculateNonTerminals();
        this.calculateTerms();
    }

    public epsilon(): string {
        return Grammar.EPSILON;
    }

    public eof(): string {
        return Grammar.EOF;
    }

    public isNonTerminal(term: string): boolean {
        return this.nonTerminals.indexOf(term) >= 0;
    }

    public getRuleById(id: number): Production {
        for(const nt of Object.keys(this.rules)) {
            for(const prod of this.rules[nt]) {
                if(prod.getId() === id) {
                    return prod;
                }
            }
        }
        return new Production(0, []);
    }

}


export class Production {

    private id: number;
    private terms: string[];
    private niceTerms: string[];

    constructor(id: number, terms: string[]) {
        this.id = id;
        this.terms = terms;
        this.niceTerms = [];
        for(const term of terms) {
            if(term === Grammar.EPSILON) {
                this.niceTerms.push('ε')
            }else {
                this.niceTerms.push(term);
            }
        }
    }

    public getId(): number {
        return this.id;
    }

    public getTerms(): string[] {
        return this.terms;
    }


    public getNiceTerms(): string[] {
        return this.niceTerms;
    }

}