import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MiPerfilComponent } from './miperfil.component';

const routes: Routes = [
  {
    path: '',
    component: MiPerfilComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MiPerfilRoutingModule { }
