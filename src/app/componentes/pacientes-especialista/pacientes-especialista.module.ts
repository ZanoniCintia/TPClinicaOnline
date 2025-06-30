// src/app/pacientes-especialista/pacientes-especialista.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacientesEspecialistaComponent } from './pacientes-especialista.component';
import { RouterModule } from '@angular/router';
import { PacientesEspecialistasRoutingModule } from './pacientes-especialistas-routing.module'; // 👉 FALTABA ESTO
import { FormatoFechaPipe } from '../../pipes/formato-fecha.pipe';
@NgModule({
  declarations: [PacientesEspecialistaComponent],
  imports: [
    CommonModule,
    RouterModule,
    PacientesEspecialistasRoutingModule ,
    FormatoFechaPipe
  ],
  exports: [PacientesEspecialistaComponent]
})
export class PacientesEspecialistaModule {}

