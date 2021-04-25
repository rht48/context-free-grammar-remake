import { AfterContentChecked, AfterContentInit, AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { CalcLrService } from '../../services/calc-lr.service';

@Component({
  selector: 'app-lr',
  templateUrl: './lr.component.html',
  styleUrls: ['./lr.component.scss']
})
export class LrComponent implements OnInit {

  @Input()
  graph = 'stateDiagram-v2;';

  constructor(public calcLrService: CalcLrService) { }
  
 

  ngOnInit(): void {
    this.graph = this.calcLrService.getAutomatonString();
  }

}
