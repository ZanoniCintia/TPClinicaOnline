import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiPerfilPacienteComponent } from './miperfilpaciente.component';
import { MiPerfilPacienteRoutingModule } from './miperfilpaciente-routing.module';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [MiPerfilPacienteComponent],
  imports: [
    
    CommonModule,
    FormsModule,
    MiPerfilPacienteRoutingModule
  ]
})
export class MiPerfilPacienteModule {}
