import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistroEspecialistaComponent } from './registro-especialista.component';

const routes: Routes = [
  { path: '', component: RegistroEspecialistaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistroEspecialistaRoutingModule {}
