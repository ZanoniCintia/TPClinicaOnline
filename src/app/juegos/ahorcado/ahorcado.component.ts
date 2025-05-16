import { Component, OnInit } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  standalone:false,
  selector: 'app-ahorcado',
  templateUrl: './ahorcado.component.html',
  styleUrls: ['./ahorcado.component.scss']
})
export class AhorcadoComponent implements OnInit {
  supabase: SupabaseClient;
  userEmail: string = '';
  userName: string = '';
  avatarUrl: string = '';

  palabras = ['ANGULAR', 'SUPABASE', 'JUEGO', 'AHORCADO', 'ARGENTINA'];
  palabraSecreta: string = '';
  palabraOculta: string[] = [];
  abecedario: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  letrasUsadas: string[] = [];
  errores: number = 0;
  mensaje: string = '';
  juegoFinalizado: boolean = false;

  get imagenActual() {
    return this.errores === 0
      ? '/assets/ahorcado.jpg'
      : `/assets/ahorcado${this.errores}.jpg`;
  }

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
      this.router.navigate(['/login']);
    }

    this.nuevaPartida();
  }

  nuevaPartida() {
    this.palabraSecreta = this.palabras[Math.floor(Math.random() * this.palabras.length)].toUpperCase();
    this.palabraOculta = Array(this.palabraSecreta.length).fill('_');
    this.letrasUsadas = [];
    this.errores = 0;
    this.mensaje = '';
    this.juegoFinalizado = false;
  }

  intentarLetra(letra: string) {
    if (this.juegoFinalizado || this.letrasUsadas.includes(letra)) return;

    this.letrasUsadas.push(letra);

    if (this.palabraSecreta.includes(letra)) {
      for (let i = 0; i < this.palabraSecreta.length; i++) {
        if (this.palabraSecreta[i] === letra) {
          this.palabraOculta[i] = letra;
        }
      }
    } else {
      this.errores++;
    }

    this.comprobarEstado();
  }

  comprobarEstado() {
    if (this.errores >= 6) {
      this.mensaje = `❌ Perdiste. Era: ${this.palabraSecreta}`;
      this.finalizarJuego('Perdió');
    } else if (!this.palabraOculta.includes('_')) {
      this.mensaje = '✅ ¡Ganaste!';
      this.finalizarJuego('Ganó');
    }
  }

  finalizarJuego(resultado: string) {
    if (this.juegoFinalizado) return;
    this.juegoFinalizado = true;

    const letrasAdivinadas = this.palabraOculta.filter(l => l !== '_').length;

    this.supabase.from('puntos').insert({
      email: this.userEmail,
      juego: 'Ahorcado',
      resultado: resultado,
      puntos: letrasAdivinadas,
      fecha: new Date().toISOString()
    }).then(({ error }) => {
      if (error) {
        console.error('❌ Error al guardar resultado:', error.message);
      } else {
        console.log('✅ Resultado guardado');
        this.router.navigate(['/juegos/historial'], {
          queryParams: { juego: 'Ahorcado' }
        });
      }
    });
  }

  volverHome() {
    this.router.navigate(['/home']);
  }
}
