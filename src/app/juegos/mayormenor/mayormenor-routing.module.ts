import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MayormenorComponent } from './mayormenor.component';

const routes: Routes = [
  { path: '', component: MayormenorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MayorMenorRoutingModule {}
