import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Grammar } from 'src/app/models/grammar';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {

  @Input()
  public grammar: Grammar;

  public text = '{}';

  constructor() { }

  ngOnInit(): void {
    this.grammar = new Grammar({}, '');
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Appends all the terms together
    this.text = '{' + this.grammar.getTerms().join(', ') + '}';
  }

}
