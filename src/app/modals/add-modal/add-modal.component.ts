import { CommonModule } from '@angular/common';
import { Component, inject, type OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { LegoService } from '../../services/lego.service';
import { SkeletonModule } from 'primeng/skeleton';
import { response } from 'express';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-add-modal',
  imports: [CommonModule, ReactiveFormsModule, InputGroupAddonModule, InputGroupModule, AutoCompleteModule, FloatLabelModule, ButtonModule, SkeletonModule],
  templateUrl: './add-modal.component.html',
  styleUrl: './add-modal.component.scss',
})
export class AddModalComponent implements OnInit {
  fb: FormBuilder;
  legoForm: FormGroup;
  legoService: LegoService;
  ref: DynamicDialogRef;

  inputOptions: string[];
  imagen_lego: string;
  imagen_pieza: string;

  ngOnInit(): void { }

  constructor() {
    this.fb = inject(FormBuilder);
    this.legoService = inject(LegoService);
    this.ref = inject(DynamicDialogRef);

    this.legoForm = this.fb.group({
      lego: [null],
      pieza: [null],
      cantidad: [null, Validators.required],
      task: [null, Validators.required],
      set_nombre: [''],
      esta_pedido: [''],
      esta_completo: [''],
      esta_reemplazado: [''],
      comentarios: [''],
    });

    this.inputOptions = [];
    this.imagen_lego = '';
    this.imagen_pieza = '';
  }

  public onAutoComplete(label: string) {
    if(this.legoForm.get(label)?.value) {
      this.legoService.getInputOptions(label, this.legoForm.get(label)?.value).subscribe({
        next: response => {
          this.inputOptions = response;
        },
        error: err => {
          console.error(err);
        }
      })
    }
  }

  public getImage(label: string) {
    this.legoService.getImage(this.legoForm.get(label)?.value, label).subscribe({
      next: response => {
        label === 'lego' ? this.imagen_lego = response : this.imagen_pieza = response;
      },
      error: err => {
        console.error(err);
      }
    })
  }

  public discardChanges() {
    this.ref.close();
  }

  public saveChanges() {
    this.ref.close(this.legoForm.value);
  }
}
