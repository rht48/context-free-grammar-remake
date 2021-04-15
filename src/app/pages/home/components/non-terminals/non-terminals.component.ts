import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Grammar } from 'src/app/models/grammar';

@Component({
  selector: 'app-non-terminals',
  templateUrl: './non-terminals.component.html',
  styleUrls: ['./non-terminals.component.scss']
})
export class NonTerminalsComponent implements OnInit, OnChanges {

  @Input()
  public grammar: Grammar;

  public text = '{}';

  constructor() { }

  ngOnInit(): void {
    this.grammar = new Grammar({}, '');
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Appends all the non terminals together
    this.text = '{' + this.grammar.getNonTerminals().join(', ') + '}';
  }
}
