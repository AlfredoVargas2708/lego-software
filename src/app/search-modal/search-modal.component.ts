import { CommonModule } from '@angular/common';
import { Component, inject, type OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { LegoService } from '../services/lego.service';
import { FormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { Lego } from '../interfaces/lego';

@Component({
  selector: 'app-search-modal',
  imports: [CommonModule, SelectModule, InputTextModule, SkeletonModule, FormsModule, ProgressSpinnerModule, ButtonModule],
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.css',
})
export class SearchModalComponent implements OnInit {
  private legoService: LegoService;

  public legoApiValue!: any;
  public isLoading: boolean;
  public isSelectChange: boolean;
  public selectValue: string;
  public inputValue: string;
  public selectOptions: string[] = ['Lego', 'Pieza']
  public imageUrl: string;
  public piezaColores: any[];

  constructor() {
    this.legoService = inject(LegoService);

    this.isLoading = false;
    this.isSelectChange = false;
    this.selectValue = '';
    this.inputValue = '';
    this.imageUrl = '';
    this.piezaColores = [];
  }


  ngOnInit(): void { }

  changeSelect() {
    this.isSelectChange = true;
  }

  searchValue() {
    this.isLoading = true;
    this.legoApiValue = null;

    this.legoService.searchLegoApiInfo(this.selectValue.toLowerCase(), this.inputValue).subscribe({
      next: response => {
        this.legoApiValue = response;
        this.imageUrl = this.selectValue.toLowerCase() === 'lego' ? this.legoApiValue.set_img_url : this.legoApiValue.pieza.element_img_url;

        if (this.selectValue.toLowerCase() === 'pieza') {
          this.legoService.getAllLegos(this.inputValue).subscribe({
            next: response => {
              let piezas = [...new Set(response.map(res => res.pieza))]
              let colorsFounded = this.legoApiValue.colors.map((color: any) =>
                color.elements.map((ele: any) =>
                  piezas.some(pieza => pieza.toString() === ele) ? color : null
                )
              );

              // ✅ Filtrar solo los objetos no nulos
              this.piezaColores = colorsFounded
                .flat() // aplana los subarrays en uno solo
                .filter((color: any) => color !== null); // elimina los null
                console.log(this.piezaColores)
            },
            error: err => {
              console.error(err)
            }
          })
        }

        this.isLoading = false;
        this.isSelectChange = false;
      },
      error: err => {
        console.error('Error en búsqueda API:', err);
        this.isLoading = false;
        this.isSelectChange = false;
      }
    });
  }

}
