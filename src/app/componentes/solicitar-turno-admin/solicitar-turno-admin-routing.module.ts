import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SolicitarTurnoComponent } from './solicitar-turno-admin.component';

const routes: Routes = [
  { path: '', component: SolicitarTurnoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminSolicitarTurnoRoutingModule {}
