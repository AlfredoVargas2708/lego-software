import { CommonModule } from '@angular/common';
import { Component, inject, type OnInit } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button'
import { Lego } from '../interfaces/lego';
import { LegoService } from '../services/lego.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Column } from '../interfaces/columns';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, TableModule, SelectModule, ButtonModule, AutoCompleteModule, FormsModule, InputTextModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  legos: Lego[];
  selectedLegos: Lego[];
  options: Column[];
  inputOptions: string[];

  optionSelected: Column;
  inputValue: string;
  totalElements: number;
  rows: number;
  isLegoSelected: boolean;
  isLoading: boolean;
  first: number;
  page: number;

  legoService: LegoService;

  constructor() {
    this.legos = [];
    this.selectedLegos = [];
    this.options = [];
    this.inputOptions = [];
    this.optionSelected = { field: '', header: '' };

    this.inputValue = '';
    this.totalElements = 0;
    this.rows = 4;
    this.isLegoSelected = false;
    this.isLoading = false;
    this.first = 0;
    this.page = 1;

    this.legoService = inject(LegoService);
  }

  ngOnInit(): void {
    this.legoService.getColumns().subscribe({
      next: response => {
        this.options = response.filter(res => res.header !== 'id')
      },
      error: err => {
        console.error(err);
      }
    })
  }

  public onAutoComplete(): void {
    if(this.inputValue !== '') {
      this.legoService.getInputOptions(this.optionSelected.field, this.inputValue).subscribe({
        next: response => {
          this.inputOptions = response;
        },
        error: err => {
          console.error(err);
        }
      })
    }
  }

  private resetPagination(): void {
    this.first = 0;
    this.page = 1;
  }

  public onSelectValue(resetPagination: boolean = true): void {
    if (resetPagination) {
      this.resetPagination();
    }
    
    this.isLoading = true;
    console.log('Enviando página:', this.page, 'Filas:', this.rows);
    this.legoService.getLegos(this.optionSelected.field, this.inputValue, this.rows, this.page).subscribe({
      next: response => {
        console.log('Respuesta del servicio:', response);
        this.legos = response.rows;
        this.totalElements = response.count;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error en el servicio:', err);
        this.isLoading = false;
      }
    })
  }

  public onEditLego(lego: Lego) {
    this.isLegoSelected = !this.isLegoSelected;
    console.log(lego)
  }

  public onPageChange(event: TablePageEvent) {
    this.first = event.first;
    this.page = Math.floor(event.first / this.rows) + 1;
    console.log('Página actual:', this.page);
    this.onSelectValue(false);
  }

  public onSubmitChanges() {
  }

}
