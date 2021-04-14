import { Component, Input, OnInit, ViewChild } from '@angular/core';
import * as mermaid from "mermaid"
import { CalculationsService } from '../../services/calculations.service';
import { ParseService } from '../../services/parse.service';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {

  @Input()
  set graph(graph: string) {
    this._graph = graph;
    this.updateGraph();
  } 
  _graph: string = 'graph TB;';

  @ViewChild('mermaid')
  public mermaidDiv;

  constructor(public parseService: ParseService, 
              private calculationsService: CalculationsService) { }

  ngOnInit(): void {
    mermaid.initialize({
      theme: 'forest'
    });
  }

  public updateGraph(): void {
    if(this._graph !== 'graph TB;') {
      const element = this.mermaidDiv.nativeElement;
      mermaid.render('gaphDiv', this._graph, (svgCode, bindFunction) => {
        element.innerHTML = svgCode;
      });
    }
  }

  private getState(id: number, name: string): string {
    return id + '(' + name + ')'
  }

}
