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
import { LegoService } from '../lego.service';
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
export class EditModalComponent implements OnInit {
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
    this.legoForm = this.fb.group({})
  }

  ngOnInit(): void {
    if (this.config.data) {
      this.legoForm = this.fb.group({
        id: [this.config.data.lego.id, [Validators.required]],
        lego: [this.config.data.lego.lego],
        pieza: [this.config.data.lego.pieza],
        image_lego: [this.config.data.lego.imagen_lego],
        image_pieza: [this.config.data.lego.imagen_pieza],
        cantidad: [this.config.data.lego.cantidad],
        task: [this.config.data.lego.task],
        set: [this.config.data.lego.set],
        esta_pedido: [this.config.data.lego.esta_pedido],
        esta_completo: [this.config.data.lego.esta_completo],
        esta_reemplazado: [this.config.data.lego.esta_reemplazado],
        comentarios: [this.config.data.lego.comentarios]
      })
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
    this.ref.close(this.legoForm.value);
  }

  cancelModal() {
    this.ref.close()
  }
}
