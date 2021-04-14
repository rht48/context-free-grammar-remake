import { Component, OnInit, Pipe, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Grammar } from 'src/app/models/grammar';
import { CalculationsService } from '../../services/calculations.service';
import { GrammarService } from '../../services/grammar.service';
import { ShowGrammarService } from '../../services/show-grammar.service';

@Component({
  selector: 'app-config-grammar',
  templateUrl: './config-grammar.component.html',
  styleUrls: ['./config-grammar.component.scss']
})
export class ConfigGrammarComponent implements OnInit {

  // Used for showing the modal
  modalRef!: BsModalRef;

  constructor(public modalService: BsModalService,
              public grammarService: GrammarService,
              public calculationsService: CalculationsService,
              public showGrammarService: ShowGrammarService) { }

  ngOnInit(): void {
  }

  openModal(template: TemplateRef<any>): void {
    // Show the modal
    this.modalRef = this.modalService.show(template);
  }

  hideModal(): void {
    this.modalRef.hide();
  }

  saveGrammar(): void {
    const grammar = this.grammarService.getGrammar();
    this.hideModal();
    this.calculationsService.setGrammar(grammar);
    this.calculationsService.calculateNull();
    this.calculationsService.calculateFirst();
    this.calculationsService.calculateFollow();
    this.calculationsService.calculateLLTable();
    this.grammarService.setGrammar(new Grammar());
  }

  parse(input: string): void {
    this.grammarService.parse(input);
  }

  
}
