import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitarTurnoComponent } from './solicitar-turno-admin.component';
import { FormsModule } from '@angular/forms';
import { AdminSolicitarTurnoRoutingModule } from './solicitar-turno-admin-routing.module';


@NgModule({
  declarations: [SolicitarTurnoComponent],
  imports: [
   
    CommonModule,
    FormsModule,
    AdminSolicitarTurnoRoutingModule
  ]
})
export class AdminSolicitarTurnoModule {}
