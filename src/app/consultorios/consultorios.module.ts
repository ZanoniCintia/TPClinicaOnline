
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultoriosRoutingModule } from './consultorios-routing.module';
import { FormsModule } from '@angular/forms';
import { HistorialComponent } from './historial/historial.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EncuestaComponent } from './encuesta/encuesta.component';



@NgModule({
  declarations: [HistorialComponent,EncuestaComponent],
  
 
  imports: [
    CommonModule,
    ConsultoriosRoutingModule,
    FormsModule,
     ReactiveFormsModule ,
    

  ]
})
export class ConsultoriosModule {}
