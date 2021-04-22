export class Node {
    parent: Node;
    id: number;
    text: string;
    constructor(parent: Node, id: number, text: string) { 
        this.parent = parent;
        this.id = id;
        this.text = text;
    }
}