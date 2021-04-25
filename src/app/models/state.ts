export class State {
    id: number;
    parent: State;
    children: Array<{transition: string, child: State}> = [];
    rules: Rule[] = [];

    constructor(id: number, parent: State) {
        this.id = id;
        this.parent = parent;
    }

    public addChild(child: {transition: string, child: State}): void {
        this.children.push(child);
    }

    public addRule(rule: Rule): void {
        this.rules.push(rule);
    }
    
    public getRulesContaining(term: string): Rule[] {
        return this.rules.filter(rule => rule.terms[rule.pointer] === term);
    }

    public equals(state: State): boolean {

        if(this.id === 3) console.log(state);
        if(this.rules.length !== state.rules.length) {
            return false;
        }
        if(this.id === 3) console.log("2");
        for(let i = 0; i < this.rules.length; i++) {
            if(!this.rules[i].equals(state.rules[i])) {
                return false;
            }
        }
        if(this.id === 3) console.log("3");
        return true;
    }
}

export class Rule {
    nonTerminal: string;
    terms: string[] = [];
    follows: string[] = [];
    pointer: number = 0;

    constructor(nonTerminal: string, terms: string[]) {
        this.nonTerminal = nonTerminal;
        this.terms = terms;
    }

    public addFollow(follow: string): void {
        this.follows.push(follow);
    }

    public productionEquals(rule: Rule): boolean {
        if(this.nonTerminal !== rule.nonTerminal) {
            return false;
        }

        if(this.pointer !== rule.pointer) {
            return false;
        }

        if(this.terms.length !== rule.terms.length) {
            return false;
        }

        for(let i = 0; i < this.terms.length; i++) {
            if(this.terms[i] !== rule.terms[i]) {
                return false;
            }
        }
        return true;
    }

    public equals(rule: Rule): boolean {
        if(this.nonTerminal !== rule.nonTerminal) {
            return false;
        }

        if(this.terms.length !== rule.terms.length) {
            return false;
        }

        if(this.follows.length !== rule.follows.length) {
            return false;
        }

        if(this.pointer !== rule.pointer) {
            return false;
        }

        for(let i = 0; i < this.terms.length; i++) {
            if(this.terms[i].indexOf(rule.terms[i]) < 0) {
                return false;
            }
        }

        for(let i = 0; i < this.follows.length; i++) {
            if(this.follows[i].indexOf(rule.follows[i]) < 0) {
                return false;
            }
        }

        return true;
    }

    public setPointer(pointer: number): void {
        this.pointer = pointer;
    }

    public nextPointer(): void {
        this.pointer++;
    }
}