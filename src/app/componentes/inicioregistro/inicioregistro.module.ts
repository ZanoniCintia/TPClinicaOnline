import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InicioregistroComponent } from './inicioregistro.component';
import { InicioregistroRoutingModule } from './inicioregistro-routing.module';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [InicioregistroComponent],
  imports: [
 
    CommonModule,
    RouterModule,
    InicioregistroRoutingModule
  ]
})
export class InicioregistroModule {}
