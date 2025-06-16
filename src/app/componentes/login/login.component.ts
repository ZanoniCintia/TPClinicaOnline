// login.component.ts (modificado con creación en usuarios si no existe)
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMsg: string = '';
  loading: boolean = false;

  constructor(private router: Router) {}

  async login() {
    this.errorMsg = '';
    this.loading = true;

    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email: this.email,
      password: this.password,
    });

    if (error) {
      this.loading = false;
      this.errorMsg = 'Usuario o contraseña incorrectos';
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;
    const emailVerificado = user?.email_confirmed_at !== null;

    if (!emailVerificado) {
      this.loading = false;
      this.errorMsg = 'Debe verificar su correo electrónico antes de ingresar.';
      return;
    }

    if (!user?.id) {
      this.loading = false;
      this.errorMsg = 'No se pudo obtener la información del usuario.';
      return;
    }

    const { data: usuarioDB, error: userQueryError } = await supabase
      .from('usuarios')
      .select('rol, estado')
      .eq('authid', user.id)
      .single();

    // Si no existe en la tabla usuarios, lo inserto
    if (userQueryError || !usuarioDB) {
      const userMetadata = user.user_metadata;
      const rol = userMetadata?.['rol'] || 'paciente';

      const { error: insertError } = await supabase.from('usuarios').insert({
        authid: user.id,
        email: user.email,
        name: userMetadata?.['nombre'] || '',
        apellido: userMetadata?.['apellido'] || '',
        rol: rol,
        estado: rol === 'especialista' ? false : true,
      });

      if (insertError) {
        this.errorMsg = 'No se pudo completar el registro del usuario';
        this.loading = false;
        return;
      }
    }

    // Repetimos consulta para tomar datos actualizados
    const { data: datosActuales, error: err2 } = await supabase
      .from('usuarios')
      .select('rol, estado')
      .eq('authid', user.id)
      .single();

    if (err2 || !datosActuales) {
      this.loading = false;
      this.errorMsg = 'No se pudo obtener el rol del usuario.';
      return;
    }

    if ((datosActuales.rol === 'especialista' || datosActuales.rol === 'paciente-especialista') && !datosActuales.estado) {
      this.loading = false;
      this.errorMsg = 'Su cuenta aún no fue habilitada por un administrador.';
      return;
    }

    await supabase.from('logs').insert({
      email: this.email,
      fecha: new Date().toISOString(),
      name: user.user_metadata?.['nombre'] || ''
    });

    this.loading = false;

    if (datosActuales.rol === 'admin') {
      this.router.navigate(['/admin']);
    } else if (datosActuales.rol === 'paciente') {
      this.router.navigate(['/home']);
    } else if (datosActuales.rol === 'especialista' || datosActuales.rol === 'paciente-especialista') {
      this.router.navigate(['/turnos']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  completarTest(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  //pedido en clase
  usuariosTest = [
  {
    email: 'paciente@paciente.com',
    password: '123456',
    avatar: 'https://okhubqbtmacszztmqiki.supabase.co/storage/v1/object/public/avatars//paciente1.png'
  },
  {
    email: 'lucasgastonpicazook@gmail.com',
    password: '123456',
    avatar: 'https://okhubqbtmacszztmqiki.supabase.co/storage/v1/object/public/avatars//paciente2.png'
  },
  {
    email: 'nuevo@paciente.com',
    password: '123456',
    avatar: 'https://okhubqbtmacszztmqiki.supabase.co/storage/v1/object/public/avatars//paciente3.png'
  },
  {
    email: 'especialista@especialista.com',
    password: '123456',
    avatar: 'https://okhubqbtmacszztmqiki.supabase.co/storage/v1/object/public/avatars//doctora.png'
  },
  {
    email: 'xekiye7685@jio1.com',
    password: '123456',
    avatar: 'https://okhubqbtmacszztmqiki.supabase.co/storage/v1/object/public/avatars//doctor.jpeg'
  },
  {
    email: 'admin@admin.com',
    password: 'admin123',
    avatar: 'https://okhubqbtmacszztmqiki.supabase.co/storage/v1/object/public/avatars//admin.png'
  }
];

completarDesdeBoton(usuario: any) {
  this.email = usuario.email;
  this.password = usuario.password;
}

}
//pedido en clase

