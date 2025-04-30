import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroComponent } from './registro.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RegistroRoutingModule } from './registro-routing.module';

@NgModule({
  declarations: [RegistroComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RegistroRoutingModule
  ]
})
export class RegistroModule {}
