import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  supabase: SupabaseClient;
  email = '';
  password = '';
  nombre = '';
  edad: number | null = null;
  avatar_url = '';

  constructor(private router: Router) {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  }

  async registrarse() {
    const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({
      email: this.email,
      password: this.password
    });

    if (signUpError) {
      console.error('Error al registrarse:', signUpError.message);
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      console.error('No se obtuvo el ID del usuario');
      return;
    }

    // Ahora insertamos en la tabla `usuarios`
    const { error: insertError } = await this.supabase
      .from('usuarios')
      .insert({
        authid: userId,
        email: this.email,
        name: this.nombre,
        age: this.edad,
        avatarurl: this.avatar_url
      });

    if (insertError) {
      console.error('Error al guardar en usuarios:', insertError.message);
      return;
    }

    console.log('Usuario registrado correctamente');
    this.router.navigate(['/login']);
  }
}
