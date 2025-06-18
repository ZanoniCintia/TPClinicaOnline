import { Routes } from '@angular/router';
import { LoginComponent} from './componentes/login/login.component';
import { HomeComponent } from './componentes/home/home.component';
import { PageNotFoundComponent } from './componentes/page-not-found/page-not-found.component';

import { RegistroComponent } from './componentes/registro/registro.component';
import { emailVerificadoGuard } from './guards/email-verificado.guard';

export const routes: Routes = [
    // Si le ponemos 'prefix' nos va a arrojar un error en la consola de redireccion infinita
    /*{ path: '', redirectTo: '/login', pathMatch: 'full' },*/

    { path: '', loadChildren: () => import('./componentes/inicio/inicio.module').then(m => m.InicioModule) }

    ,
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
        ,canActivate: [emailVerificadoGuard]
    },
    {
      path: 'admin',
      loadChildren: () => import('./componentes/admin/admin.module').then(m => m.AdminModule)
    },
    {
        path: 'consultorios',
        loadChildren: () =>
          import('./consultorios/consultorios.module').then(m => m.ConsultoriosModule)
         ,canActivate: [emailVerificadoGuard]
    },
    {
        path: 'registro-especialista',
        loadChildren: () =>
          import('./componentes/registro-especialista/registro-especialista.module').then(m => m.RegistroEspecialistaModule),
    },
    {
       path: 'inicioregistro',
        loadChildren: () =>
          import('./componentes/inicioregistro/inicioregistro.module').then(m=>m.InicioregistroModule),

    },
    {
       path: 'solicitar-turno',
        loadChildren: () =>
          import('./componentes/solicitar-turno/solicitar-turno.module').then(m=>m.SolicitarTurnoModule),

    },
    {
        path: 'captcha',
        loadChildren: () => import('./componentes/captcha/captcha.module').then(m => m.CaptchaModule)
    },
    {
        path: 'turnos',
        loadChildren: () => import('./componentes/turnos/turnos.module').then(m => m.TurnosModule)
    },
    {
        path: 'turnos-especialista',
        loadChildren: () => import('./componentes/turnos-especialista/turnos-especialista.module').then(m => m.TurnosEspecialistaModule)
    },
    {
      path: 'mi-perfil',
            loadChildren: () => import('./componentes/miperfil/miperfil.module').then(m => m.MiPerfilModule)
    },
    {
      path: 'mi-perfil-paciente',
            loadChildren: () => import('./componentes/miperfilpaciente/miperfilpaciente.module').then(m => m.MiPerfilPacienteModule)
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

