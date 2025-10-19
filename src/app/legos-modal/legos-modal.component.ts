import { Component, inject, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LegoService } from '../services/lego.service';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-legos-modal',
  imports: [FormsModule, InputTextModule, ButtonModule, ProgressSpinnerModule, SkeletonModule],
  templateUrl: './legos-modal.component.html',
  styleUrl: './legos-modal.component.css',
})
export class LegosModalComponent implements OnInit {
  private legoService: LegoService;
  
  public isLoading: boolean;
  public inputValue: string;
  public legoApiValue: any;

  constructor() {
    this.legoService = inject(LegoService);

    this.isLoading = false;
    this.inputValue = '';
  }

  ngOnInit(): void { }

  public searchLego() {
    this.isLoading = true;

    this.legoService.searchLegoApiInfo('lego', this.inputValue).subscribe({
      next: response => {
        this.legoApiValue = response;
        console.log(this.legoApiValue)
      },
      error: err => {
        console.error(err);
      }
    })

    setTimeout(() => {
      this.isLoading = false;
    }, 1000)
  }

}
