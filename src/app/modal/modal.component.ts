import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Lego } from '../interfaces/lego';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Tooltip } from 'primeng/tooltip';
import { AutoComplete } from 'primeng/autocomplete';
import { LegoService } from '../services/lego.service';
import { ButtonModule } from 'primeng/button';
import { IftaLabelModule } from 'primeng/iftalabel';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-modal',
  imports: [CommonModule, ReactiveFormsModule, InputGroupModule, InputTextModule, InputGroupAddon,
    Tooltip, AutoComplete, ButtonModule, IftaLabelModule, FloatLabelModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent implements OnInit {
  public legoForm: FormGroup;
  public config: DynamicDialogConfig;
  private fb: FormBuilder;
  private legoService: LegoService;
  private cdr: ChangeDetectorRef;
  private ref: DynamicDialogRef;

  public lego!: Lego;
  public options: string[];

  constructor() {
    this.fb = inject(FormBuilder);
    this.config = inject(DynamicDialogConfig);
    this.legoService = inject(LegoService);
    this.cdr = inject(ChangeDetectorRef);
    this.ref = inject(DynamicDialogRef);

    this.options = [];
    this.legoForm = this.fb.group({
      id: [null, [Validators.required]],
      lego: [null],
      pieza: [null],
      image_lego: [''],
      image_pieza: [''],
      cantidad: [null],
      task: [null],
      set_nombre: [''],
      esta_pedido: [''],
      esta_completo: [''],
      esta_reemplazado: [''],
      comentarios: ['']
    })
  }

  ngOnInit(): void {
    if (this.config.data.lego) {
      this.legoForm.patchValue({
        id: this.config.data.lego.id,
        lego: this.config.data.lego.lego,
        pieza: this.config.data.lego.pieza,
        image_lego: this.config.data.lego.imagen_lego,
        image_pieza: this.config.data.lego.imagen_pieza,
        cantidad: this.config.data.lego.cantidad,
        task: this.config.data.lego.task,
        set_nombre: this.config.data.lego.set_nombre,
        esta_pedido: this.config.data.lego.esta_pedido,
        esta_completo: this.config.data.lego.esta_completo,
        esta_reemplazado: this.config.data.lego.esta_reemplazado,
        comentarios: this.config.data.lego.comentarios
      });
    }
  }

  public getOptions(field: string) {
    if (this.legoForm.get(field)?.value !== '') {
      this.legoService.getInputOptions(field, this.legoForm.get(field)?.value).subscribe({
        next: response => {
          this.options = response;
        },
        error: err => {
          console.error('[getOptions] error obteniendo opciones:', err);
        }
      })
    } else {
      this.options = [];
    }
  }

  public onSelectLego(event: any) {
    const selectedValue = event?.value;
    if (!selectedValue) return;

    this.legoService.getImage(selectedValue, 'lego').subscribe({
      next: response => {
        this.legoForm.get('image_lego')?.setValue(response);
        this.cdr.detectChanges(); // fuerza el update visual si el tooltip ya estaba abierto
      },
      error: err => console.error('[onSelectLego] Error obteniendo imagen:', err)
    });
  }

  public onSelectPieza(event: any) {
    const selectedValue = event?.value;
    if (!selectedValue) return;

    this.legoService.getImage(selectedValue, 'pieza').subscribe({
      next: response => {
        this.legoForm.get('image_pieza')?.setValue(response);
        this.cdr.detectChanges();
      },
      error: err => console.error('[onSelectPieza] Error obteniendo imagen:', err)
    });
  }

  closeModal() {
    let newLego = {
      lego: this.legoForm.get('lego')?.value !== '' ? this.legoForm.get('lego')?.value : null,
      pieza: this.legoForm.get('pieza')?.value !== '' ? this.legoForm.get('pieza')?.value : null,
      cantidad: this.legoForm.get('cantidad')?.value !== '' ? this.legoForm.get('cantidad')?.value : null,
      task: this.legoForm.get('task')?.value !== '' ? this.legoForm.get('task')?.value : null,
      set_nombre: this.legoForm.get('set_nombre')?.value,
      esta_pedido: this.legoForm.get('esta_pedido')?.value,
      esta_completo: this.legoForm.get('esta_completo')?.value,
      esta_reemplazado: this.legoForm.get('esta_reemplazado')?.value,
      comentarios: this.legoForm.get('comentarios')?.value
    }
    this.ref.close(this.config.data.isEditing ? this.legoForm.value : newLego);
  }

  cancelModal() {
    this.ref.close()
  }
}
