import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, type OnInit } from '@angular/core';
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
import { LegoService } from '../services/lego.service';
import { DialogService } from 'primeng/dynamicdialog';
import { ModalComponent } from '../modal/modal.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PiezasModalComponent } from '../piezas-modal/piezas-modal.component';
import { LegosModalComponent } from '../legos-modal/legos-modal.component';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, Select, TableModule, FormsModule, ButtonModule, ConfirmDialog, ConfirmDialogModule, Toast, AutoComplete, ProgressSpinnerModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  providers: [ConfirmationService, MessageService, DialogService]
})
export class LayoutComponent implements OnInit {

  private confirmationService: ConfirmationService;
  private dialogService: DialogService;
  private messageService: MessageService;
  private legoService: LegoService;
  private cdr: ChangeDetectorRef;

  legos: Lego[];
  cols: Column[];
  selectOptions: Column[];
  options: string[];
  buscarSelectOptions: any[];
  selectValue: Column;
  inputValue: string;
  buscarSelectValue: string;
  rows: number;
  first: number;
  page: number;
  isLoading: boolean;
  isSelected: boolean;
  totalRecords: number;

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
    this.selectValue = { field: '', header: '', minwidth: '' };
    this.selectOptions = []
    this.buscarSelectOptions = ['Lego', 'Pieza']
    this.buscarSelectValue = '';
    this.rows = 4;
    this.first = 0;
    this.page = 1;
    this.totalRecords = 0;
    this.isLoading = false;
    this.isSelected = false;
  }

  ngOnInit(): void {
    this.legoService.getColumns().subscribe({
      next: response => {
        this.cols.push({ field: 'imagen_pieza', header: 'imagen pieza', minwidth: '150px' }, { field: 'imagen_lego', header: 'imagen lego', minwidth: '150px' },
          { field: 'color_pieza', header: 'color pieza', minwidth: '150px' }
        )
        this.cols = [ ...this.cols, ...response.filter(c => c.field !== 'id')]
        this.selectOptions = response.filter(c => c.field !== 'id');
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
    this.isSelected = true;
    this.legoService.getLegos(this.selectValue.field, this.inputValue, this.rows, this.page).subscribe({
      next: response => {
        this.legos = response.rows;
        this.totalRecords = response.count;
        this.isLoading = false;
        this.isSelected = false;
        this.cdr.markForCheck();
      },
      error: err => {
        console.error("[getLegos] error obteniendo legos:", err);
      }
    })
  }

  public pageChange(event: TablePageEvent) {
    this.first = event.first;
    this.rows = event.rows;
    this.page = Math.ceil(this.first / this.rows) + 1;

    this.getLegos();
  }

  public onEdit(lego: Lego) {
    console.log(lego);
    const dialogRef = this.dialogService.open(ModalComponent, {
      header: 'Editar Lego',
      width: '50vw',
      height: '50vw',
      modal: true,
      closable: true,
      closeOnEscape: true,
      data: {
        lego: lego, isEditing: true
      }, // Pass a copy of the lego object
      contentStyle: { overflow: 'auto' },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    // Handle modal close
    dialogRef?.onClose.subscribe((result: Lego) => {
      if (result) {
        console.log('Modal closed with result:', result);
        // Here you can update the lego in your list or save to backend
        this.legoService.editLego(result).subscribe({
          next: response => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: response.message
            });
            if (this.selectValue.field === 'lego' && result.lego !== lego.lego) {
              this.inputValue = result.lego.toString();
            } else if (this.selectValue.field === 'pieza' && result.pieza !== lego.pieza) {
              this.inputValue = result.pieza.toString();
            } else if (this.selectValue.field === 'task' && result.task !== lego.task) {
              this.inputValue = result.task.toString();
            }

            this.getLegos();
          },
          error: err => {
            this.messageService.add({
              severity: 'danger',
              summary: 'Error',
              detail: 'Error al editar el lego'
            });
          }
        })
      } else {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'No se edito el lego'
        });
      }
    });
  }

  public openAddModal() {
    const dialogRef = this.dialogService.open(ModalComponent, {
      header: 'Agregar Lego',
      width: '50vw',
      height: '50vw',
      modal: true,
      closable: true,
      closeOnEscape: true,
      data: { isEditing: false },
      contentStyle: { overflow: 'auto' },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    dialogRef?.onClose.subscribe((result: any) => {
      if (result) {
        this.legoService.addLego(result).subscribe({
          next: response => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: response.message
            });
            if (result.lego !== null) {
              this.inputValue = result.lego.toString();
              this.selectValue = { field: 'lego', header: 'lego', minwidth: '150px' }
            } else if (result.pieza !== null) {
              this.inputValue = result.pieza.toString();
              this.selectValue = { field: 'pieza', header: 'pieza', minwidth: '150px' }
            } else if (result.task !== null) {
              this.inputValue = result.task.toString();
              this.selectValue = { field: 'task', header: 'task', minwidth: '150px' }
            }

            this.getLegos();
          },
          error: err => {
            this.messageService.add({
              severity: 'danger',
              summary: 'Error',
              detail: err
            });
          }
        })
      } else {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'No se agrego el lego'
        });
      }
    });
  }

  public onDelete(lego_id: number) {
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
        this.legoService.deleteLego(lego_id).subscribe({
          next: response => {
            this.messageService.add({ severity: 'info', summary: 'Confirmado', detail: response.message });
            this.getLegos();
          },
          error: err => {
            console.error('[onDelete] error eliminando el lego:', err);
          }
        })
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Cancelado', detail: 'No se elimino el lego' });
      },
    })
  }

  public openModal() {
    this.buscarSelectValue === 'Lego' ? this.openLegoModal() : this.openPiezasModal();
  }

  public openPiezasModal() {
    const dialogRef = this.dialogService.open(PiezasModalComponent, {
      header: 'Buscar Pieza',
      width: '60vw',
      height: '700px',
      modal: true,
      closable: true
    })

    dialogRef?.onClose.subscribe((result) => {
      if(result) {
        let { type, value } = result;

        let selectIdx = this.cols.findIndex(col => col.field === type);
        if(selectIdx !== -1) this.selectValue = this.cols[selectIdx]
        this.inputValue = value;
        this.getLegos();
        this.buscarSelectValue = '';
      }else {
        this.buscarSelectValue = '';
      }
    })
  }

  public openLegoModal() {
    const dialogRef = this.dialogService.open(LegosModalComponent, {
      header: 'Buscar Lego',
      width: '60vw',
      height: '700px',
      modal: true,
      closable: true
    })

    dialogRef?.onClose.subscribe((result) => {
      if(result) {
        this.buscarSelectValue = '';
      }else {
        this.buscarSelectValue = '';
      }
    })
  }

}
