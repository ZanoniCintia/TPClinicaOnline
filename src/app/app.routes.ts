import { Routes } from '@angular/router';
import { LoginComponent } from './componentes/login/login.component';


export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'home',
        loadComponent: () => import('./componentes/home/home.component').then(m => m.HomeComponent),
    },
    {
        path: 'quien-soy',
        loadComponent: () => import('./componentes/quien-soy/quien-soy.component').then(m => m.QuienSoyComponent),
    },
  
];

