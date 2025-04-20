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
  
    let avatarUrl = '';
  
    // 1. Si hay imagen, la subo al bucket primero
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
      avatarUrl = urlData.publicUrl;
    }
  
    // 2. Crear usuario y guardar metadata
    const { data: signupData, error: signupError } = await this.supabase.auth.signUp({
      email: this.email,
      password: this.password,
      options: {
        data: {
          name: this.nombre,
          age: this.edad,
          avatar_url: avatarUrl
        }
      }
    });
  
    if (signupError) {
      this.error = 'Este correo ya está registrado.';
      return;
    }
  
    const userId = signupData.user?.id;
    if (!userId) {
      this.error = 'No se pudo obtener el ID del usuario.';
      return;
    }
  
    // 3. Guardar datos adicionales en tabla usuarios
    const { error: insertError } = await this.supabase.from('usuarios').insert({
      authid: userId,
      email: this.email,
      name: this.nombre,
      age: this.edad,
      avatarurl: avatarUrl
    });
  
    if (insertError) {
      this.error = 'Error al guardar los datos del usuario.';
      return;
    }
  
    // 4. Login automático
    const { error: loginError } = await this.supabase.auth.signInWithPassword({
      email: this.email,
      password: this.password
    });
  
    if (loginError) {
      this.error = 'Error al iniciar sesión automáticamente.';
      return;
    }
  
    // 5. Redirigir al home
    this.mensaje = 'Registro exitoso!';
    this.router.navigate(['/home']);
  }

  seleccionarArchivo(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.avatarFile = file;
    }
  }
  
  
}