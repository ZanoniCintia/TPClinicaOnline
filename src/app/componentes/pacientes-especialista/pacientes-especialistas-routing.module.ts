// src/app/pacientes-especialista/pacientes-especialistas-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PacientesEspecialistaComponent } from './pacientes-especialista.component';


const routes: Routes = [
  { path: '', component: PacientesEspecialistaComponent },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PacientesEspecialistasRoutingModule {}
