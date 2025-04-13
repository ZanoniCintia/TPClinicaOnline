import { Routes } from '@angular/router';
import { LoginComponent} from './componentes/login/login.component';
import { HomeComponent } from './componentes/home/home.component';
import { PageNotFoundComponent } from './componentes/page-not-found/page-not-found.component';

import { QuienSoyComponent } from './componentes/quien-soy/quien-soy.component';


export const routes: Routes = [
    // Si le ponemos 'prefix' nos va a arrojar un error en la consola de redireccion infinita
    { path: '', redirectTo: '/home', pathMatch: "full" },
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    {
        path: 'quien-soy', component: QuienSoyComponent ,
       /* children:
            [
                {
                    path: "detalle/:productId",
                    component: ProductDetailComponent
                }
            ]*/
    },
    // La ruta comodin debe ir siempre al final
    { path: '**', component: PageNotFoundComponent },
    
];

