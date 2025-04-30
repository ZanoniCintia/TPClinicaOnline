
import { Component, OnInit } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';


@Component({
  standalone:false,
  selector: 'app-mayormenor',
  templateUrl: './mayormenor.component.html',
  styleUrls: ['./mayormenor.component.scss']
})
export class MayormenorComponent implements OnInit {
  cartas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]; // As de 1 a Rey (13)
  cartaActual: number = 0;
  cartaNueva: number = 0;
  puntaje: number = 0;
  mensaje: string = '';

  ngOnInit(): void {
    this.reiniciarJuego();
  }

  reiniciarJuego() {
    this.cartaActual = this.randomCarta();
    this.mensaje = '';
    this.puntaje = 0;
  }

  randomCarta(): number {
    return this.cartas[Math.floor(Math.random() * this.cartas.length)];
  }

  adivinar(respuesta: 'mayor' | 'menor') {
    this.cartaNueva = this.randomCarta();
    const esMayor = this.cartaNueva > this.cartaActual;
    const esCorrecto =
      (respuesta === 'mayor' && esMayor) || (respuesta === 'menor' && !esMayor);

    if (esCorrecto) {
      this.puntaje++;
      this.mensaje = '✅ ¡Correcto!';
    } else {
      this.mensaje = `❌ Fallaste. Era ${this.cartaNueva}. Puntaje final: ${this.puntaje}`;
      this.puntaje = 0;
    }

    this.cartaActual = this.cartaNueva;
  }
}
