import { Component, OnInit } from '@angular/core';
import { Grammar } from 'src/app/models/grammar';

@Component({
  selector: 'home-page',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {

  public grammar: Grammar;

  constructor() { 
    this.grammar = new Grammar({}, '');
   }

  ngOnInit(): void { }

  public setGrammar(grammar: Grammar): void {
    this.grammar = grammar;
  }
}
