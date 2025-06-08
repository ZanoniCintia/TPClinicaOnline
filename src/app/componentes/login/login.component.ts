import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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

    if (userQueryError || !usuarioDB) {
      this.loading = false;
      this.errorMsg = 'No se pudo obtener el rol del usuario.';
      return;
    }

    if ((usuarioDB.rol === 'especialista' || usuarioDB.rol === 'paciente-especialista') && !usuarioDB.estado) {
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

    if (usuarioDB.rol === 'admin') {
      this.router.navigate(['/admin']);
    } else if (usuarioDB.rol === 'paciente') {
      this.router.navigate(['/home']);
    } else if (usuarioDB.rol === 'especialista' || usuarioDB.rol === 'paciente-especialista') {
      this.router.navigate(['/turnos']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  completarTest(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}
