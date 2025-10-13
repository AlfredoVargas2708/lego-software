import { CommonModule } from '@angular/common';
import { Component, inject, type OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LegoService } from '../services/lego.service';
import { FormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Lego } from '../interfaces/lego';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-piezas-modal',
  imports: [CommonModule, InputTextModule, ButtonModule, FormsModule, ProgressSpinnerModule],
  templateUrl: './piezas-modal.component.html',
  styleUrl: './piezas-modal.component.css',
})
export class PiezasModalComponent implements OnInit {
  private legoService: LegoService;
  private ref: DynamicDialogRef;

  public inputValue: string;
  public piezas: any[];
  public piezasInDB: Lego[];
  public piezasFounded: Lego[];
  public isLoading: boolean;
  public copiedPiece: string;

  constructor() {
    this.legoService = inject(LegoService);
    this.ref = inject(DynamicDialogRef);

    this.inputValue = '';
    this.piezas = [];
    this.piezasInDB = [];
    this.piezasFounded = [];
    this.isLoading = false;
    this.copiedPiece = '';
  }

  ngOnInit(): void {
    this.legoService.getAllLegos().subscribe({
      next: response => {
        this.piezasInDB = response;
      },
      error: err => {
        console.error(err);
      }
    })
  }

  public searchPieza() {
    this.isLoading = true;
    this.legoService.searchLegoApiInfo('pieza', this.inputValue).subscribe({
      next: response => {
        this.piezas = response;
        let elements = response.map(res => res.elements).flat();

        elements.forEach(ele => {
          const pieza = this.piezasInDB.filter(pieza => pieza.pieza !== null).find(pieza => pieza.pieza.toString() === ele);
          if(pieza !== undefined) this.piezasFounded.push(pieza);
        })

        let prueba: any[] = [];

        this.piezasFounded.forEach(pieza => {
          const idx = response.findIndex(ele => ele.elements.includes(pieza.pieza.toString()));
          if(idx !== -1) prueba.push(this.piezas[idx]);
        })

        this.piezas = this.piezas.map(pieza => {
          return {
            ...pieza,
            available: prueba.find(piece => piece.color_id === pieza.color_id) ? true : false,
            isClicked: false
          }
        });
        this.isLoading = false
      },
      error: err => {
        console.error('Error in searchPieza:', err);
      }
    })
  }

  public clickImage(color_id: number) {
    this.piezas = this.piezas.map(pieza => {
      return {
        ...pieza,
        isClicked: pieza.color_id === color_id ? !pieza.isClicked : false
      }
    });

    console.log(this.piezasFounded);
    console.log();

    let piezaClicked = this.piezas.find(pieza => pieza.isClicked === true);
    piezaClicked.elements.forEach((ele: any) => {
      let codeIdx = this.piezasFounded.findIndex(pieza => pieza.pieza.toString() === ele);
      if(codeIdx !== -1) this.copiedPiece = this.piezasFounded[codeIdx].pieza.toString();
    })
  }

  public copyPiezaCode () {
    console.log(this.copiedPiece);

    this.ref.close({ type: 'pieza', value: this.copiedPiece });
  }

}
