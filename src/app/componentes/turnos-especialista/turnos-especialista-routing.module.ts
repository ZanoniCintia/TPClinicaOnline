import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TurnosEspecialistaComponent } from './turnos-especialista.component';

const routes: Routes = [
  { path: '', component: TurnosEspecialistaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TurnosEspecialistaRoutingModule {}

