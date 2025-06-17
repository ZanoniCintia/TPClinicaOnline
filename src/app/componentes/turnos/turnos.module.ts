import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnosRoutingModule } from './turnos-routing.module';
import { TurnosComponent } from './turnos.component';
import { ModalInputModule } from "../modal-input/modal-input.module";

@NgModule({
  declarations: [TurnosComponent],
  imports: [
    CommonModule,
    FormsModule,
    TurnosRoutingModule,
    ModalInputModule
]
})
export class TurnosModule {}
