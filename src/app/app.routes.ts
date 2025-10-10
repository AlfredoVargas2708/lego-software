import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
        title: 'Legos'
    }
];
