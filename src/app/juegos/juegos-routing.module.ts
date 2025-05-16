
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HistorialComponent } from './historial/historial.component';



const routes: Routes = [
  {
    path: 'adivina-emojis',
    loadChildren: () =>
      import('./adivina-emojis/adivina-emojis.module').then(m => m.AdivinaEmojisModule)
  },
  {
    path: 'ahorcado',
    loadChildren: () =>
      import('./ahorcado/ahorcado.module').then(m => m.AhorcadoModule)
  },
  {
    path: 'mayormenor',
    loadChildren: () =>
      import('./mayormenor/mayormenor.module').then(m => m.MayorMenorModule)
  },
  {
    path: 'chat',
    loadChildren: () =>
      import('./chat/chat.module').then(m => m.ChatModule)
  },
  {
    path: 'preguntados',
    loadChildren: () => import('./preguntados/preguntados.module').then(m => m.PreguntadosModule)
  },
  {
    path: 'historial',
    component: HistorialComponent
  }
  
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JuegosRoutingModule {}
