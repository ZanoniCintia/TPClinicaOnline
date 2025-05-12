import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreguntadosComponent } from './preguntados.component';
import { PreguntadosRoutingModule } from './preguntados-routing.module';

@NgModule({
  declarations: [PreguntadosComponent],
  imports: [
    CommonModule,
    FormsModule,
    PreguntadosRoutingModule
  ]
})
export class PreguntadosModule {}
