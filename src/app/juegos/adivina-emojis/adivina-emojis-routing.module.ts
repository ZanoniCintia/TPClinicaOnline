import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdivinaEmojisComponent } from './adivina-emojis.component';

const routes: Routes = [
  { path: '', component: AdivinaEmojisComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdivinaEmojisRoutingModule {}
