import { Component, OnInit } from '@angular/core';
import { ArrayStrategy, NumberStrategy } from 'src/app/models/strategies/strategy';
import { CalcLlService } from '../../services/calc-ll.service';

@Component({
  selector: 'app-ll',
  templateUrl: './ll.component.html',
  styleUrls: ['./ll.component.scss']
})
export class LlComponent implements OnInit {

  constructor(public calcLlService: CalcLlService) { }

  ngOnInit(): void {
  }

  getArrayStrategy() {
    return new ArrayStrategy();
  }

  getNumberStrategy() {
    return new NumberStrategy();
  }

}
