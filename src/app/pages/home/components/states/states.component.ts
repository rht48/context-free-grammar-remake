import { AfterViewInit, Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CalculationsService } from '../../services/calculations.service';
import { ParseService } from '../../services/parse.service';
import * as mermaid from "mermaid"

@Component({
  selector: 'app-states',
  templateUrl: './states.component.html',
  styleUrls: ['./states.component.scss']
})
export class StatesComponent implements OnInit, AfterViewInit {

  @Input()
  set graph(graph: string) {
    this._graph = graph;
    this.updateGraph();
  } 
  _graph: string = 'stateDiagram-v2;';

  @ViewChildren('mermaidStates')
  public list: QueryList<any>;

  public mermaidDiv;


  constructor(public parseService: ParseService, 
              private calculationsService: CalculationsService) { }
  
  
  public ngAfterViewInit() {
    this.mermaidDiv = this.list.first;
    this.updateGraph();
  }

  ngOnInit(): void {
    mermaid.initialize({
      theme: 'forest'
    });
  }

  public updateGraph(): void {
    if(this._graph !== 'stateDiagram-v2;') {
      if(this.mermaidDiv !== undefined) {
        const element = this.mermaidDiv.nativeElement;
        mermaid.render('graphDiv', this._graph, (svgCode, bindFunction) => {
          element.innerHTML = svgCode;
        });
      }
    }
  }

  private getState(id: number, name: string): string {
    return id + '(' + name + ')'
  }

}
