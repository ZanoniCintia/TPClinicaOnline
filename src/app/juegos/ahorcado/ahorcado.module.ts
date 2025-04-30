import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AhorcadoComponent } from './ahorcado.component';
import { AhorcadoRoutingModule } from './ahorcado-routing.module';

@NgModule({
  declarations: [AhorcadoComponent],
  imports: [
    CommonModule,
    FormsModule,
    AhorcadoRoutingModule
  ]
})
export class AhorcadoModule {}

