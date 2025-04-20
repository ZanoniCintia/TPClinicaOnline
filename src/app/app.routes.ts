import { Routes } from '@angular/router';
import { LoginComponent} from './componentes/login/login.component';
import { HomeComponent } from './componentes/home/home.component';
import { PageNotFoundComponent } from './componentes/page-not-found/page-not-found.component';
import { QuienSoyComponent } from './componentes/quien-soy/quien-soy.component';
import { RegistroComponent } from './componentes/registro/registro.component';

export const routes: Routes = [
    // Si le ponemos 'prefix' nos va a arrojar un error en la consola de redireccion infinita
    { path: '', redirectTo: '/home', pathMatch: "full" },
    
    { path: 'login',
        loadComponent: () =>
            import('./componentes/login/login.component').then((m) => m.LoginComponent)
    },
    { path: 'quien-soy', component: QuienSoyComponent},

    { path: 'registro',
        loadComponent: () =>
            import('./componentes/registro/registro.component').then((m) => m.RegistroComponent)
    },
    {
        path: 'home',
          loadComponent: () => import('./componentes/home/home.component').then(m => m.HomeComponent)
      },
    // La ruta comodin debe ir siempre al final
    { path: '**', component: PageNotFoundComponent },
    
];

 /* children:
            [
                {
                    path: "detalle/:productId",
                    component: ProductDetailComponent
                }
            */

