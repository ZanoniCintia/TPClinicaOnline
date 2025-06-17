import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  supabase: SupabaseClient;
  usuarios: any[] = [];
  cargando: boolean = false;
  error = '';
  mensaje = '';
  router: Router;

  emailNuevo = '';
  passNuevo = '';
  nombreNuevo = '';

  nuevoAdmin = {
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    edad: null,
    dni: ''
  };

  avatarFile: File | null = null;

  constructor(router: Router) {
    this.router = router;
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  }

  async ngOnInit() {
    await this.cargarUsuarios();
  }

  async cargarUsuarios() {
    this.cargando = true;
    const { data, error } = await this.supabase.from('usuarios').select('*');
    if (error) {
      this.error = 'Error al cargar usuarios';
    } else {
      this.usuarios = data;
    }
    this.cargando = false;
  }

  seleccionarAvatar(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.avatarFile = file;
    }
  }

  async alternarEstado(usuario: any) {
    const nuevoEstado = !usuario.estado;
    const { error } = await this.supabase
      .from('usuarios')
      .update({ estado: nuevoEstado })
      .eq('authid', usuario.authid);

    if (!error) {
      usuario.estado = nuevoEstado;
    }
  }

  async crearUsuarioAdmin(email: string, password: string, nombre: string) {
    const { data: signup, error: signupError } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, rol: 'admin' } }
    });

    if (signupError || !signup.user?.id) {
      this.error = signupError?.message || 'No se pudo crear el admin';
      return;
    }

    await this.supabase.from('usuarios').insert({
      authid: signup.user.id,
      email,
      rol: 'admin',
      nombre,
      estado: true
    });

    this.cargarUsuarios();
  }

  async crearAdmin() {
    this.mensaje = '';
    this.error = '';

    const { email, password, nombre, apellido, edad, dni } = this.nuevoAdmin;

    if (!email || !password || !nombre || !apellido || !edad || !dni) {
      this.error = 'Todos los campos son obligatorios.';
      return;
    }

    const { data: authData, error: signupError } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          apellido,
          rol: 'admin'
        }
      }
    });

    if (signupError || !authData.user?.id) {
      this.error = signupError?.message || 'Error creando usuario admin';
      return;
    }

    const userId = authData.user.id;

    let avatarUrl = '';
    if (this.avatarFile) {
      const fileName = `admin_${Date.now()}_${this.avatarFile.name}`;
      const { error: uploadError } = await this.supabase.storage.from('avatars').upload(fileName, this.avatarFile);

      if (uploadError) {
        this.error = 'Error al subir imagen.';
        return;
      }

      const { data: publicData } = this.supabase.storage.from('avatars').getPublicUrl(fileName);
      avatarUrl = publicData?.publicUrl || '';
    }

    const { error: insertError } = await this.supabase.from('usuarios').insert({
      authid: userId,
      email,
      nombre,
      apellido,
      edad,
      dni,
      rol: 'admin',
      avatarurl: avatarUrl,
      estado: true
    });

    if (insertError) {
      this.error = 'Error al guardar usuario en base de datos.';
      return;
    }

    this.mensaje = 'Administrador creado exitosamente ✅';
    this.nuevoAdmin = { email: '', password: '', nombre: '', apellido: '', edad: null, dni: '' };
    this.avatarFile = null;
    this.cargarUsuarios();
  }

  async logout() {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      console.error('Error cerrando sesión:', error.message);
    } else {
      this.router.navigate(['/login']);
    }
  }

    irATurnos() {
    this.router.navigate(['/turnos']);
  }

}
