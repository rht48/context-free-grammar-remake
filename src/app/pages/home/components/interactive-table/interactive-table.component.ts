import { Component, Input, OnInit } from '@angular/core';
import { NumberArrayStrategy } from 'src/app/models/strategies/strategy';

@Component({
  selector: 'app-interactive-table',
  templateUrl: './interactive-table.component.html',
  styleUrls: ['./interactive-table.component.scss']
})
export class InteractiveTableComponent implements OnInit {

  @Input()
  public parserTable = {};
  
  public strategy = new NumberArrayStrategy();

  constructor() { }

  ngOnInit(): void {
  }

  public columns(): string[] {
    const keys = Object.keys(this.parserTable);
    if(keys.length > 0) {
      return Object.keys(this.parserTable[keys[0]]);
    }
    return [];
  }

  public rows(): string[] {
    return Object.keys(this.parserTable);
  }

}
