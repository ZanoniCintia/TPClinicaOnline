import { Component, OnInit } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-adivina-emojis',
  standalone: false,
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
    { emoji: '👠👸', nombre: 'Cenicienta' },
    { emoji: '🔍🐠🌊', nombre: 'Buscando a Nemo' },
    { emoji: '🚀👨‍🚀🤠', nombre: 'Toy Story' },
    { emoji: '🐘👂🎪', nombre: 'Dumbo' },
    { emoji: '🧞‍♂️🕌🐒', nombre: 'Aladdin' },
    { emoji: '🐉🤺⚔👦', nombre: 'Cómo Entrenar a tu Dragón' },
    { emoji: '💃🌹👹', nombre: 'La Bella y la Bestia' }
  ];

  peliculaActual: any;
  respuestaUsuario = '';
  mensaje = '';
  intentosRestantes = 3;
  aciertos: number = 0;
  indiceActual: number = 0;
  peliculasAMostrar: any[] = [];
  juegoFinalizado: boolean = false;


  constructor(private router: Router) {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  }

ngOnInit(): void {
  this.obtenerUsuario();
}

async obtenerUsuario() {
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

  this.iniciarJuego();
}

iniciarJuego() {
  this.peliculasAMostrar = this.peliculas.sort(() => 0.5 - Math.random()).slice(0, 10);
  this.indiceActual = 0;
  this.aciertos = 0;
  this.juegoFinalizado = false;
  this.mensaje = '';
  this.nuevaPelicula();
}



  volverHome() {
    this.router.navigate(['/home']);
  }

 nuevaPelicula() {
  if (this.indiceActual >= 10) {
    this.finalizarJuego();
    return;
  }

  this.peliculaActual = this.peliculasAMostrar[this.indiceActual];
  this.respuestaUsuario = '';
  this.mensaje = '';
  this.intentosRestantes = 3;
}


verificar() {
  const normalizar = (texto: string) =>
    texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (normalizar(this.respuestaUsuario.trim()) === normalizar(this.peliculaActual.nombre)) {
    this.mensaje = '✅ ¡Correcto!';
    this.aciertos++;
    setTimeout(() => {
      this.indiceActual++;
      this.nuevaPelicula();
    }, 1000);
  } else {
    this.intentosRestantes--;
    if (this.intentosRestantes === 0) {
      this.mensaje = `❌ Perdiste esta. Era: ${this.peliculaActual.nombre}`;
      setTimeout(() => {
        this.indiceActual++;
        this.nuevaPelicula();
      }, 1500);
    } else {
      this.mensaje = `❌ Incorrecto. Te quedan ${this.intentosRestantes} intentos.`;
    }
  }
}
  finalizarJuego() {
  this.juegoFinalizado = true;

  this.supabase.from('puntos').insert({
    email: this.userEmail,
    juego: 'Adivina con Emojis',
    resultado: 'Finalizado',
    puntos: this.aciertos
  }).then(({ error }) => {
    if (error) {
      console.error('❌ Error al guardar resultado final:', error.message);
    } else {
      console.log('✅ Resultado final guardado');
    }
  });
}



  reiniciar() {
    this.nuevaPelicula();
  }
}

