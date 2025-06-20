import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SolicitarTurnoComponent } from './solicitar-turno.component';
import { SolicitarTurnoRoutingModule } from './solicitar-turno.routing.module';


@NgModule({

  declarations: [SolicitarTurnoComponent],
  imports: [

    CommonModule,
    FormsModule,
    RouterModule,
    SolicitarTurnoRoutingModule
  ]
})
export class SolicitarTurnoModule {}
