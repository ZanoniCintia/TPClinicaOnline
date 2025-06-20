import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnosEspecialistaComponent } from './turnos-especialista.component';
import { TurnosEspecialistaRoutingModule } from './turnos-especialista-routing.module';
import { ModalInputModule } from '../modal-input/modal-input.module';


@NgModule({
  declarations: [TurnosEspecialistaComponent],
  imports: [

    CommonModule,
    FormsModule,
    TurnosEspecialistaRoutingModule,
    ModalInputModule
  ]
})
export class TurnosEspecialistaModule {}
