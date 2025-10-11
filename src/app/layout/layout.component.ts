import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, type OnInit } from '@angular/core';
import { Select } from 'primeng/select'
import { TableModule } from 'primeng/table';
import { Lego } from '../interfaces/lego';
import { FormsModule } from '@angular/forms';
import { Column } from '../interfaces/columns';
import { ButtonModule } from "primeng/button";
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { AutoComplete } from 'primeng/autocomplete';
import { ProgressSpinner } from 'primeng/progressspinner';
import { LegoService } from '../lego.service';
import { DialogService } from 'primeng/dynamicdialog';
import { EditModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, Select, TableModule, FormsModule, ButtonModule, ConfirmDialog, ConfirmDialogModule, Toast, AutoComplete, ProgressSpinner],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  providers: [ConfirmationService, MessageService, DialogService]
})
export class LayoutComponent implements OnInit{

  private confirmationService: ConfirmationService;
  private dialogService: DialogService;
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
    this.dialogService = inject(DialogService);

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

  public clearInput() {
    this.inputValue = '';
    this.legos = [];
  }

  public getLegos() {
    this.isLoading = true;
    this.legoService.getLegos(this.selectValue.field, this.inputValue).subscribe({
      next: response => {
        this.legos = response.rows;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: err => {
        console.error("[getLegos] error obteniendo legos:", err);
      }
    })
  }

  public onEdit(lego: Lego) {
    console.log(lego);
    const dialogRef = this.dialogService.open(EditModalComponent, {
        header: 'Editar Lego',
        width: '50vw',
        height: '50vw',
        modal: true,
        closable: true,
        closeOnEscape: true,
        data: { lego: lego }, // Pass a copy of the lego object
        contentStyle: { overflow: 'auto' },
        breakpoints: {
          '960px' : '75vw',
          '640px' : '90vw'
        }
      });

    // Handle modal close
    dialogRef?.onClose.subscribe((result) => {
      if (result) {
        console.log('Modal closed with result:', result);
        // Here you can update the lego in your list or save to backend
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Éxito', 
          detail: 'Lego actualizado correctamente' 
        });
      } else {
        console.log('Modal closed without saving');
      }
    });
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
