
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HistorialComponent } from './historial/historial.component';
import { EncuestaComponent } from './encuesta/encuesta.component';



const routes: Routes = [
  
  {
    path: 'historial',
    component: HistorialComponent
  },
  {
    path: 'encuesta',
    component: EncuestaComponent
  }
  
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsultoriosRoutingModule {}
