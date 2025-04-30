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
  private supabase: SupabaseClient = createClient(environment.apiUrl, environment.publicAnonKey);

  email = '';
  password = '';
  nombre = '';
  edad: number | null = null;
  avatarFile: File | null = null;
  mensaje = '';
  error = '';

  constructor(private router: Router) {}

  async registrarse() {
    this.mensaje = '';
    this.error = '';
  
    // Validaciones básicas
    if (!this.email || !this.password || !this.nombre || this.edad == null) {
      this.error = 'Todos los campos son obligatorios (excepto el avatar).';
      return;
    }
  
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
    if (!emailValido) {
      this.error = 'El correo ingresado no es válido.';
      return;
    }
  
    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
  
    // Subida de avatar (si se seleccionó)
    let avatarUrl = '';
    if (this.avatarFile) {
      const fileName = `${Date.now()}_${this.avatarFile.name}`;
      const { error: uploadError } = await this.supabase.storage
        .from('avatars')
        .upload(fileName, this.avatarFile);
  
      if (uploadError) {
        this.error = 'Error al subir la imagen.';
        return;
      }
  
      const { data: urlData } = this.supabase.storage.from('avatars').getPublicUrl(fileName);
      avatarUrl = urlData?.publicUrl || '';
    }
  
    // Preparar metadata sin nulls
    const metadata: any = {
      name: this.nombre,
      age: this.edad,
    };
    if (avatarUrl) {
      metadata.avatar_url = avatarUrl;
    }
  
    // Registro en Supabase Auth
    const { data: signupData, error: signupError } = await this.supabase.auth.signUp({
      email: this.email,
      password: this.password,
      options: { data: metadata },
    });
  
    if (signupError) {
      if (signupError.message.includes('User already registered')) {
        this.error = 'Este correo ya está registrado.';
      } else {
        this.error = 'Error al registrar usuario.';
      }
      return;
    }
  
    const userId = signupData.user?.id;
    if (!userId) {
      this.error = 'No se pudo obtener el ID del usuario.';
      return;
    }
  
    // Insertar en la tabla usuarios
    const { error: insertError } = await this.supabase.from('usuarios').insert({
      authid: userId,
      email: this.email,
      name: this.nombre,
      age: this.edad,
      avatarurl: avatarUrl || null
    });
  
    if (insertError) {
      this.error = 'Error al guardar los datos del usuario.';
      return;
    }
  
    // Login automático
    const { error: loginError } = await this.supabase.auth.signInWithPassword({
      email: this.email,
      password: this.password,
    });
  
    if (loginError) {
      this.error = 'Registro exitoso, pero no se pudo iniciar sesión.';
      return;
    }
  
    this.mensaje = 'Registro exitoso ✅';
    this.router.navigate(['/home']);
  }
  

  seleccionarArchivo(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.avatarFile = file;
    }
  }
  
}