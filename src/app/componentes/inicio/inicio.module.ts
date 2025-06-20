import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InicioComponent } from './inicio.component';
import { InicioRoutingModule } from './inicio-routing.module';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [InicioComponent],
  imports: [
   
    CommonModule,
    RouterModule,
    InicioRoutingModule
  ]
})
export class InicioModule {}
