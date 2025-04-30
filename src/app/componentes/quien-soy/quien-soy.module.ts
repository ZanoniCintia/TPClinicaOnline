import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuienSoyComponent } from './quien-soy.component';
import { RouterModule } from '@angular/router';
import { QuienSoyRoutingModule } from './quien-soy-routing.module';

@NgModule({
  declarations: [QuienSoyComponent],
  imports: [
    CommonModule,
    RouterModule,
    QuienSoyRoutingModule
  ]
})
export class QuienSoyModule {}
