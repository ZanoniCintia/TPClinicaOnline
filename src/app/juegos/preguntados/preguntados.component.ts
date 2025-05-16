import { Component, OnInit, OnDestroy } from '@angular/core';
import { PreguntadosService } from '../../servicios/preguntados.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router'
@Component({
  standalone:false,
  selector: 'app-preguntados',
  templateUrl: './preguntados.component.html',
  styleUrls: ['./preguntados.component.scss']
})
export class PreguntadosComponent implements OnInit, OnDestroy {
  imagenPersonaje = '';
  opciones: string[] = [];
  respuestaCorrecta = '';
  mensaje = '';
  puntos = 0;
  userEmail = '';
  userName = '';
  supabase: SupabaseClient;

  preguntaActual = 1;
  totalPreguntas = 10;
  juegoFinalizado = false;

  segundosRestantes = 5;
  temporizador: any;

  constructor(private preguntadosService: PreguntadosService, private router: Router) {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  }

  ngOnInit(): void {
    this.obtenerUsuario();
    this.cargarPregunta();
  }

  ngOnDestroy(): void {
    clearInterval(this.temporizador);
  }

  async obtenerUsuario() {
    const { data: { session } } = await this.supabase.auth.getSession();
    const user = session?.user;
    if (user) {
      this.userEmail = user.email || '';
      const { data } = await this.supabase
        .from('usuarios')
        .select('name')
        .eq('email', this.userEmail)
        .single();
      this.userName = data?.name || '';
    }
  }

  cargarPregunta() {
    if (this.preguntaActual > this.totalPreguntas) {
      this.finalizarJuego();
      return;
    }

    this.segundosRestantes = 5;
    clearInterval(this.temporizador);
    this.iniciarTemporizador();

    this.preguntadosService.obtenerPersonajesSimpsons().subscribe((personajes: any[]) => {
      const personaje = personajes[0];
      this.imagenPersonaje = personaje.image;
      this.respuestaCorrecta = personaje.character;

      const opcionesIncorrectas = personajes
        .slice(1)
        .map(p => p.character)
        .filter(nombre => nombre !== this.respuestaCorrecta)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      this.opciones = [...opcionesIncorrectas, this.respuestaCorrecta].sort(() => Math.random() - 0.5);
    });
  }

  iniciarTemporizador() {
    this.temporizador = setInterval(() => {
      this.segundosRestantes--;
      if (this.segundosRestantes === 0) {
        clearInterval(this.temporizador);
        this.preguntaActual++;
        this.mensaje = `⏰ Tiempo agotado. Era: ${this.respuestaCorrecta}`;
        setTimeout(() => {
          this.mensaje = '';
          this.cargarPregunta();
        }, 2000);
      }
    }, 1000);
  }

  seleccionar(opcion: string) {
    clearInterval(this.temporizador);

    if (opcion === this.respuestaCorrecta) {
      this.mensaje = '✅ ¡Correcto!';
      this.puntos++;
    } else {
      this.mensaje = `❌ Incorrecto. Era: ${this.respuestaCorrecta}`;
    }

    this.preguntaActual++;

    setTimeout(() => {
      this.mensaje = '';
      this.cargarPregunta();
    }, 2000);
  }

finalizarJuego() {
  this.juegoFinalizado = true;
  clearInterval(this.temporizador);

  const puntosValidados = this.puntos >= 0 ? this.puntos : 0;

  this.supabase.from('puntos').insert({
    email: this.userEmail,
    juego: 'Preguntados',
    resultado: 'Finalizado',
    puntos: puntosValidados
  })
  .then(({ error }) => {
    if (error) {
      console.error('❌ Error al registrar puntaje:', error.message);
    } else {
      console.log('✅ Puntaje guardado');
    }
  });
  this.router.navigate(['/juegos/historial'], {
  queryParams: { juego: 'Preguntados' }
});


}



  volverHome() {
    location.href = '/home';
  }
}
