import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, type OnInit } from '@angular/core';
import { Select } from 'primeng/select'
import { TableModule, TablePageEvent } from 'primeng/table';
import { Lego } from '../interfaces/lego';
import { FormsModule } from '@angular/forms';
import { Column } from '../interfaces/columns';
import { ButtonModule } from "primeng/button";
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { AutoComplete } from 'primeng/autocomplete';
import { LegoService } from '../lego.service';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, Select, TableModule, FormsModule, ButtonModule, ConfirmDialog, ConfirmDialogModule, Toast, AutoComplete],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService, MessageService]
})
export class LayoutComponent implements OnInit {

  private confirmationService: ConfirmationService;
  private messageService: MessageService;
  private legoService: LegoService;
  private cdr: ChangeDetectorRef;

  legos: Lego[];
  cols: Column[];
  options: string[];
  selectValue: Column;
  inputValue: string;
  rows: number;
  isLoading: boolean;

  constructor() {

    this.confirmationService = inject(ConfirmationService);
    this.messageService = inject(MessageService);
    this.legoService = inject(LegoService);
    this.cdr = inject(ChangeDetectorRef);

    this.legos = [];
    this.cols = [];
    this.options = [];
    this.inputValue = '';
    this.selectValue = { field: '', header: '' };
    this.rows = 5;
    this.isLoading = false;
  }

  ngOnInit(): void {
    this.legoService.getColumns().subscribe({
      next: response => {
        this.cols = response.filter(c => c.field !== 'id');
        this.cdr.markForCheck();
      },
      error: err => {
        console.error('[GetColumns] error obteniendo las columnas:', err);
      }
    })
  }

  public onInput() {
    if (this.inputValue !== '') {
      this.legoService.getInputOptions(this.selectValue.field, this.inputValue).subscribe({
        next: response => {
          this.options = response;
          this.cdr.markForCheck();
        },
        error: err => {
          console.error('[onInput] error obteniendo las opciones:', err);
        }
      })
    }
  }

  public getLegos() {
    this.isLoading = true;
    this.legoService.getLegos(this.selectValue.field, this.inputValue).subscribe({
      next: response => {
        this.legos = response.rows;
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }, 2000)
      },
      error: err => {
        console.error("[getLegos] error obteniendo legos:", err);
      }
    })
  }

  public onEdit(lego: Lego) {
    console.log(lego)
  }

  public onDelete(lego_id: number) {
    console.log(lego_id)
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar el lego?',
      header: 'Eliminar',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Eliminar',
        severity: 'danger',
      },

      accept: () => {
        this.messageService.add({ severity: 'info', summary: 'Confirmado', detail: 'Lego Eliminado' });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Cancelado', detail: 'No se elimino el lego' });
      },
    })
  }

}
