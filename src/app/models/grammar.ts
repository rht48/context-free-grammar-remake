export class Grammar {

    private rules = {};
    private nonTerminals: string[];
    private terms: string[];
    private entryPoint: string;

    public static EPSILON = 'epsilon';
    public static EOF = 'EOF';

    constructor(rules, entryPoint) {
        this.rules = rules;
        this.entryPoint = entryPoint;
        this.calculateNonTerminals();
        this.calculateTerms();
    }

    private calculateNonTerminals(): void {
        this.nonTerminals = Object.keys(this.rules);
    }

    private calculateTerms(): void {
        for(const nonTerminal of this.nonTerminals) {
            const productions: Production[] = this.rules[nonTerminal];
            for(const production of productions) {
                for(const term of production.getTerms()) {
                    if(this.nonTerminals.indexOf(term) < 0) {
                        this.terms.push(term);
                    }
                }
            }
        }
    }

    public getRules() {
        return this.rules;
    }

    public getNonTerminals(): string[] {
        return this.nonTerminals;
    }

    public getTerms(): string[] {
        return this.terms;
    }

}


export class Production {

    private id: number;
    private terms: string[];

    constructor(id: number, terms: string[]) {
        this.id = id;
        this.terms = terms;
    }

    public getId(): number {
        return this.id;
    }

    public getTerms(): string[] {
        return this.terms;
    }

}