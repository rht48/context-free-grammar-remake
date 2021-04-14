import { Component, Input, OnInit } from '@angular/core';
import { DefaultStrategy, Strategy } from 'src/app/models/strategies/strategy';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  @Input() table = {}
  @Input() strategy: Strategy = new DefaultStrategy();
  @Input() type = 'simple';

  constructor() { }

  ngOnInit(): void {
  }

  keys() {
    return Object.keys(this.table);
  }

  length(): number {
    if(this.keys().length === 0) {
      return 0;
    }
    return this.table[this.keys()[0]].length;
  }

  range(): number[] {
    let arr = [];
    const len = this.length();
    for(let i = 0; i < len; i++) {
      arr.push(i);
    }
    return arr;
  }

  nonterminals(): string[] {
    if(this.type === 'simple') {
      return this.keys();
    }
    let arr = [];
    for(const key of this.keys()) {
      for(const nonterminal of Object.keys(this.table[key])) {
        if(arr.indexOf(nonterminal) === -1) {
          arr.push(nonterminal);
        }
      }
    }
    return arr;
  }

}
