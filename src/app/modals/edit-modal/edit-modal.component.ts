import { CommonModule } from '@angular/common';
import { Component, inject, type OnInit } from '@angular/core';
import { Lego } from '../../interfaces/lego';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { LegoService } from '../../services/lego.service';

@Component({
  selector: 'app-edit-modal',
  imports: [CommonModule, ReactiveFormsModule, InputGroupAddonModule, InputGroupModule, AutoCompleteModule, FloatLabelModule, ButtonModule],
  templateUrl: './edit-modal.component.html',
  styleUrl: './edit-modal.component.scss',
})
export class EditModalComponent implements OnInit {
  config: DynamicDialogConfig;
  fb: FormBuilder;
  legoService: LegoService;
  ref: DynamicDialogRef;

  lego!: Lego;
  legoForm: FormGroup;

  inputOptions: string[] | number[];

  constructor() {
    this.config = inject(DynamicDialogConfig);
    this.fb = inject(FormBuilder);
    this.legoService = inject(LegoService);
    this.ref = inject(DynamicDialogRef);

    this.legoForm = this.fb.group({});
    this.inputOptions = [];
  }

  ngOnInit(): void {
    this.lego = this.config.data?.lego;
    if (!this.lego) {
      console.error('No lego data provided to edit modal');
      this.ref.close();
      return;
    }
    this.prepareForm();
  }

  private prepareForm() {
    if (!this.lego || typeof this.lego !== 'object') {
      console.error('Invalid lego data provided to prepareForm');
      return;
    }
    
    let controls = Object.keys(this.lego).filter(key => key !== 'id' && key !== 'lego_nombre' && key !== 'color_pieza');
    controls.forEach(ctrl => {
      this.legoForm.addControl(ctrl, new FormControl((this.lego as any)[ctrl]));
    });
  }

  public onAutoComplete(label: string) {
    let value = this.legoForm.get(label)?.value;

    this.legoService.getInputOptions(label, value).subscribe({
      next: response => {
        this.inputOptions = response;
      },
      error: err => {
        console.error(err);
      }
    })
  }

  public getImage(label: string) {
    let value = this.legoForm.get(label)?.value;
    this.legoService.getImage(value, label).subscribe({
      next: response => {
        this.legoForm.get(`imagen_${label}`)?.setValue(response);
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
