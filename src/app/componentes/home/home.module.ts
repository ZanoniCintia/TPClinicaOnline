import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from '../home/home-routing.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalInputModule } from "../modal-input/modal-input.module";
import { EstadoUsuarioPipe } from '../../pipes/estado-usuario.pipe';
import { NombreCompletoPipe } from '../../pipes/nombre-completo.pipe';
import { FormatoFechaPipe } from '../../pipes/formato-fecha.pipe';
import { InicialesPipe } from '../../pipes/iniciales.pipe';
import { InicialMayusculaPipe } from '../../pipes/inicial-mayuscula.pipe';
import { ResaltarDirective } from '../../directivas/resaltar.directive';
import { SoloNumerosDirective } from '../../directivas/solo-numeros.directive';
import { EstadoColorDirective } from '../../directivas/estado-color.directive';

@NgModule({
  declarations: [HomeComponent],
  imports: [
     ResaltarDirective,
    SoloNumerosDirective,
    EstadoColorDirective,
    InicialMayusculaPipe,
    InicialesPipe,
    EstadoUsuarioPipe,
    NombreCompletoPipe,
    FormatoFechaPipe,
    CommonModule,
    FormsModule,
    RouterModule,
    HomeRoutingModule,
    ModalInputModule
],
  exports: [
    ResaltarDirective,
    SoloNumerosDirective,
    EstadoColorDirective
  ]
})
export class HomeModule {}