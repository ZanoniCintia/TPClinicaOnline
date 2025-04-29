import { Component, OnInit } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-adivina-emojis',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './adivina-emojis.component.html',
  styleUrls: ['./adivina-emojis.component.scss'],
})
export class AdivinaEmojisComponent implements OnInit {
  supabase: SupabaseClient;
  userEmail: string = '';
  userName: string = '';
  avatarUrl: string = '';

  peliculas = [
    { emoji: '🦁👑', nombre: 'El Rey León' },
    { emoji: '❄️👸', nombre: 'Frozen' },
    { emoji: '🍎👸🏻', nombre: 'Blancanieves' },
    { emoji: '👠👸', nombre: 'Cenicienta' }
  ];

  peliculaActual: any;
  respuestaUsuario = '';
  mensaje = '';
  intentosRestantes = 3;

  constructor(private router: Router) {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  }

  async ngOnInit() {
    const { data: { session } } = await this.supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.userEmail = user.email || '';

    const { data, error } = await this.supabase
      .from('usuarios')
      .select('name, avatarurl')
      .eq('email', this.userEmail)
      .single();

    if (data) {
      this.userName = data.name;
      this.avatarUrl = data.avatarurl;
    } else {
      console.error('Usuario no encontrado en tabla usuarios', error);
      this.router.navigate(['/login']);
    }

    this.nuevaPelicula();
  }

  volverHome() {
    this.router.navigate(['/home']);
  }

  nuevaPelicula() {
    const randomIndex = Math.floor(Math.random() * this.peliculas.length);
    this.peliculaActual = this.peliculas[randomIndex];
    this.respuestaUsuario = '';
    this.mensaje = '';
    this.intentosRestantes = 3;
  }

  verificar() {
    const normalizar = (texto: string) =>
      texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (normalizar(this.respuestaUsuario.trim()) === normalizar(this.peliculaActual.nombre)) {
      this.mensaje = '✅ ¡Correcto!';
      this.supabase.from('puntos').insert({
        email: this.userEmail,
        juego: 'Adivina con Emojis',
        puntos: 1,
        fecha: new Date().toISOString()
      });
    } else {
      this.intentosRestantes--;
      if (this.intentosRestantes === 0) {
        this.mensaje = `❌ Perdiste. Era: ${this.peliculaActual.nombre}`;
      } else {
        this.mensaje = `❌ Incorrecto. Te quedan ${this.intentosRestantes} intentos.`;
      }
    }
  }

  reiniciar() {
    this.nuevaPelicula();
  }
}

