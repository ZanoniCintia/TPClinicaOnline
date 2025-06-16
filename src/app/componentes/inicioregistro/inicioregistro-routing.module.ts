import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioregistroComponent } from './inicioregistro.component';

const routes: Routes = [
  { path: '', component: InicioregistroComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InicioregistroRoutingModule { }
