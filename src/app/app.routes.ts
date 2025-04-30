import { Routes } from '@angular/router';
import { LoginComponent} from './componentes/login/login.component';
import { HomeComponent } from './componentes/home/home.component';
import { PageNotFoundComponent } from './componentes/page-not-found/page-not-found.component';
import { QuienSoyComponent } from './componentes/quien-soy/quien-soy.component';
import { RegistroComponent } from './componentes/registro/registro.component';

export const routes: Routes = [
    // Si le ponemos 'prefix' nos va a arrojar un error en la consola de redireccion infinita
    /*{ path: '', redirectTo: '/login', pathMatch: 'full' },*/

    { path: '', loadChildren: () => import('./componentes/inicio/inicio.module').then(m => m.InicioModule) }

    ,{
        path: 'quien-soy',
        loadChildren: () =>
          import('./componentes/quien-soy/quien-soy.module').then(m => m.QuienSoyModule),
      },
      {
        path: 'login',
        loadChildren: () =>
          import('./componentes/login/login.module').then(m => m.LoginModule),
      },
      {
        path: 'registro',
        loadChildren: () =>
          import('./componentes/registro/registro.module').then(m => m.RegistroModule),
      },
    {
        path: 'home',
        loadChildren: () => import('./componentes/home/home.module').then(m => m.HomeModule)
    },
    {
        path: 'juegos',
        loadChildren: () =>
          import('./juegos/juegos.module').then(m => m.JuegosModule)
      }
    // La ruta comodin debe ir siempre al final
    ,{ path: '**', component: PageNotFoundComponent },
    
];

 /* children:
            [
                {
                    path: "detalle/:productId",
                    component: ProductDetailComponent
                }
            */

