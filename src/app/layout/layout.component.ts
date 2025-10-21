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
import { SkeletonModule } from 'primeng/skeleton'
import { Column } from '../interfaces/columns';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogService } from 'primeng/dynamicdialog';
import { EditModalComponent } from '../modals/edit-modal/edit-modal.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AddModalComponent } from '../modals/add-modal/add-modal.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, TableModule, SelectModule, ButtonModule, AutoCompleteModule, FormsModule, InputTextModule,
    SkeletonModule, ProgressSpinnerModule, ToastModule, ConfirmDialogModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  providers: [DialogService, MessageService, ConfirmationService]
})
export class LayoutComponent implements OnInit {
  legos: Lego[];
  selectedLegos: Lego[];
  options: Column[];
  inputOptions: string[];
  selectOptions: Column[];

  optionSelected: Column;
  legoSelected!: Lego;
  inputValue: string;
  totalElements: number;
  rows: number;
  isLegoSelected: boolean;
  isLoading: boolean;
  firstLoading: boolean;
  first: number;
  page: number;

  legoService: LegoService;
  dialogService: DialogService;
  messageService: MessageService;
  confirmationService: ConfirmationService;

  constructor() {
    this.legos = [];
    this.selectedLegos = [];
    this.selectOptions = [];
    this.options = [];
    this.inputOptions = [];
    this.optionSelected = { field: '', header: '' };

    this.inputValue = '';
    this.totalElements = 0;
    this.rows = 4;
    this.isLegoSelected = false;
    this.isLoading = false;
    this.firstLoading = false;
    this.first = 0;
    this.page = 1;

    this.legoService = inject(LegoService);
    this.dialogService = inject(DialogService);
    this.messageService = inject(MessageService);
    this.confirmationService = inject(ConfirmationService);
  }

  ngOnInit(): void {
    this.legoService.getColumns().subscribe({
      next: response => {
        let optionsFiltered = response.filter(res => res.header !== 'id');
        this.selectOptions = optionsFiltered;
        this.options.push({ field: 'imagen_lego', header: 'imagen lego'}, { field: 'imagen_pieza', header: 'imagen pieza'})
        optionsFiltered.forEach(opt => {
          if(opt.header === 'set nombre') {
            this.options.push({ field: 'lego_nombre', header: 'lego nombre'});
            this.options.push(opt);
          }else if (opt.header === 'pieza') {
            this.options.push(opt);
            this.options.push({ field: 'color_pieza', header: 'color pieza'})
          }
          else {
            this.options.push(opt)
          }
        })
      },
      error: err => {
        console.error(err);
      }
    })
  }

  public onAutoComplete(): void {
    if (this.inputValue !== '') {
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

    this.selectedLegos = [];
    this.isLegoSelected = false;
    this.isLoading = true;
    this.firstLoading = true;
    this.legoService.getLegos(this.optionSelected.field, this.inputValue, this.rows, this.page).subscribe({
      next: response => {
        this.legos = response.rows;
        this.totalElements = response.count;
        this.firstLoading = false;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error en el servicio:', err);
        this.isLoading = false;
      }
    })
  }

  public onEditLego() {
    this.isLegoSelected = this.selectedLegos.length > 0;
    if (this.selectedLegos.length === 1) {
      this.legoSelected = this.selectedLegos[0];
    }
  }

  public onPageChange(event: TablePageEvent) {
    this.first = event.first;
    this.page = Math.floor(event.first / this.rows) + 1;
    this.selectedLegos = [];
    this.isLegoSelected = false;
    this.onSelectValue(false);
  }

  public openEditModal(lego: Lego) {
    if (!lego) {
      console.error('No lego selected for editing');
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se ha seleccionado ningún lego para editar', life: 2000 });
      return;
    }

    const dialogRef = this.dialogService.open(EditModalComponent, {
      header: 'Editar Pieza de Lego',
      width: '60vw',
      height: '600px',
      modal: true,
      closable: true,
      data: { lego: lego }
    });

    dialogRef?.onClose.subscribe(result => {
      if(result) {
        let legoEdited = { id: this.legoSelected.id, lego: result.lego, pieza: result.pieza, cantidad: result.cantidad, task: result.task, esta_reemplazado: result.esta_reemplazado,
          esta_completo: result.esta_completo, esta_pedido: result.esta_pedido };
        this.legoService.editLego(legoEdited).subscribe({
          next: response => {
            this.messageService.add({ severity: 'success', summary: response.message, life: 2000 });
            this.selectedLegos = [];
            this.isLegoSelected = false;
            this.onSelectValue(false);
          },
          error: err => {
            console.error(err);
            this.messageService.add({ severity: 'danger', summary: err.message, life: 2000 });
          }
        })
      }else {
        this.messageService.add({ severity: 'info', summary: 'No se generaron cambios', life: 2000 });
      }
    })
  }

  public openAddModal() {
    const dialogRef = this.dialogService.open(AddModalComponent, {
      header: 'Agregar Nuevo Lego',
      width: '60vw',
      height: '600px',
      modal: true,
      closable: true
    })

    dialogRef?.onClose.subscribe(result => {
      if(result) {
        this.legoService.addLego(result).subscribe({
          next: response => {
            this.messageService.add({ severity: 'success', summary: response.message, life: 2000 });
            this.optionSelected = result.lego !== null ? { field: 'lego', header: 'lego' } : result.pieza !== null ? { field: 'pieza', header: 'pieza' } 
              : { field: 'task', header: 'task' };
            this.inputValue = result.lego !== null ? result.lego : result.pieza !== null ? result.pieza : result.task;
            this.onSelectValue(this.legos.length > this.rows);
          },
          error: err => {
            this.messageService.add({ severity: 'danger', summary: err.message, life: 2000 });
          }
        })
      }else {
        this.messageService.add({ severity: 'info', summary: 'No se agrego el lego', life: 2000 });
      }
    })
  }

  public onDeleteLego(lego_id: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar?',
      header: 'Eliminar',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Eliminar',
        severity: 'danger'
      },

      accept: () => {
        this.legoService.deleteLego(lego_id).subscribe({
          next: response => {
            this.messageService.add({ severity: 'info', summary: response.message, life: 2000 });
            this.selectedLegos = [];
            this.isLegoSelected = false;
            this.onSelectValue(false);
          },
          error: err => {
            this.messageService.add({ severity: 'danger', summary: err.message, life: 2000 });
          }
        })
      },

      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Eliminación Rechazada', life: 2000 });
    },
    })
  }

}
