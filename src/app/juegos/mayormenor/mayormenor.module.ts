import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MayorMenorComponent } from './mayormenor.component';
import { MayorMenorRoutingModule } from './mayormenor-routing.module';


@NgModule({
  declarations: [MayorMenorComponent],
  imports: [
    CommonModule,
    FormsModule,
    MayorMenorRoutingModule
  ]
})
export class MayorMenorModule {}
