import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiPerfilComponent } from './miperfil.component';
import { MiPerfilRoutingModule } from './miperfil-routing.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    MiPerfilComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MiPerfilRoutingModule
  ]
})
export class MiPerfilModule { }
