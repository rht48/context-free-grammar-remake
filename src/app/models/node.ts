export class Node {
    parent: Node;
    children: Node[] = [];
    id: number;
    text: string;
    constructor(parent: Node, id: number, text: string) { 
        this.parent = parent;
        this.id = id;
        this.text = text;
    }

    public addChild(child: Node): void {
        this.children.push(child);
    }

    public hash(): string {
        let childrenIds = '';
        for(const child of this.children) {
            childrenIds += child.id;
        }
        return this.children.length + childrenIds + this.id;
    }
}