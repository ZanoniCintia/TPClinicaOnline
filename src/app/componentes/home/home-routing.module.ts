import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { emailVerificadoGuard } from '../../guards/email-verificado.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [emailVerificadoGuard]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {} 
