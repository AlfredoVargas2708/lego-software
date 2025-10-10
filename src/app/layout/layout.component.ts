import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, ViewChild, type OnInit } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { Select, SelectChangeEvent } from 'primeng/select'
import { TableModule } from 'primeng/table';
import { Lego } from '../interfaces/lego';
import { FormsModule } from '@angular/forms';
import { Column } from '../interfaces/columns';
import { ButtonModule } from "primeng/button";
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, Select, InputText, TableModule, FormsModule, ButtonModule, ConfirmDialog, ConfirmDialogModule, Toast],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService, MessageService]
})
export class LayoutComponent implements OnInit {

  @ViewChild('inputElement', { static: false }) inputElement!: ElementRef;

  private confirmationService: ConfirmationService;
  private messageService: MessageService;

  legos: Lego[];
  cols: Column[];
  inputValue: string | number;

  constructor() {

    this.confirmationService = inject(ConfirmationService);
    this.messageService = inject(MessageService);

    this.legos = [];
    this.cols = [
      { field: 'lego', header: 'lego' },
      { field: 'pieza', header: 'pieza' },
      { field: 'cantidad', header: 'cantidad' },
      { field: 'task', header: 'task' },
      { field: 'set', header: 'set' },
      { field: 'esta_pedido', header: 'esta pedido' },
      { field: 'esta_completo', header: 'esta completo' },
      { field: 'esta_reemplazado', header: 'esta reemplazado' },
      { field: 'comentarios', header: 'comentarios' },
    ];
    this.inputValue = '';
  }

  ngOnInit(): void {
    this.legos.push({
      id: 0,
      cantidad: 0,
      comentarios: '',
      esta_completo: '',
      esta_pedido: '',
      esta_reemplazado: '',
      imagen_lego: '',
      imagen_pieza: '',
      lego: 0,
      pieza: 0,
      set: '',
      task: 0
    },
      {
        id: 1,
        cantidad: 1,
        comentarios: '',
        esta_completo: '',
        esta_pedido: '',
        esta_reemplazado: '',
        imagen_lego: '',
        imagen_pieza: '',
        lego: 1,
        pieza: 1,
        set: '',
        task: 1
      })
  }

  public onSelectChange(event: SelectChangeEvent) {
    console.log(event.value);

    setTimeout(() => {
      if (this.inputElement && this.inputElement.nativeElement) {
        this.inputElement.nativeElement.focus();
      }
    }, 0);
  }

  public onInput() {
    console.log(this.inputValue)
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
