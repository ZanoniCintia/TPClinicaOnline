
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JuegosRoutingModule } from '../juegos/juegos-routing.module';
import { FormsModule } from '@angular/forms';
import { HistorialComponent } from './historial/historial.component';


@NgModule({
  declarations: [HistorialComponent],
 
  imports: [
    CommonModule,
    JuegosRoutingModule,
    FormsModule,
    

  ]
})
export class JuegosModule {}
