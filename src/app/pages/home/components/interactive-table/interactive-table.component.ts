import { Component, Input, OnInit } from '@angular/core';
import { NumberArrayStrategy } from 'src/app/models/strategies/strategy';
import { CalcLrService } from '../../services/calc-lr.service';

@Component({
  selector: 'app-interactive-table',
  templateUrl: './interactive-table.component.html',
  styleUrls: ['./interactive-table.component.scss']
})
export class InteractiveTableComponent implements OnInit {

  @Input()
  public parserTable = {};
  
  public strategy = new NumberArrayStrategy();

  constructor(private calcLrService: CalcLrService) { }

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

  public getInnerHTML(row: string, col: string): string {
    const actions = this.parserTable[row][col];
    if(actions.length === 1) {
      return `${this.parserTable[row][col]}`;
    }else {
      let res = '';
      for(const action of actions) {
        res += `<div>
                  <input type="radio" name="flexRadioDefault-${row}-${col}" id="flexRadioDefault-${row}-${col}">
                  <label for="flexRadioDefault-${row}-${col}">
                    ${action}
                  </label>
                </div>`;
      }
      return res;
    }
  }

  public changeAction(row: string, col: string, action: string): void {
    this.calcLrService.setAction(+row, col, action);
  }

}
