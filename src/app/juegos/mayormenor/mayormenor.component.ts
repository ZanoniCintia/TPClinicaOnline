import { Component, OnInit } from '@angular/core';
import { CartasService } from '../../servicios/cartas.service';
import { Router } from '@angular/router';

@Component({
  standalone:false,
  selector: 'app-mayormenor',
  templateUrl: './mayormenor.component.html',
  styleUrls: ['./mayormenor.component.scss']
})
export class MayorMenorComponent implements OnInit {

  deckId: string = '';
  cartaActual: any = null;
  puntaje: number = 0;
  mensaje: string = '';
  juegoTerminado: boolean = false;

  constructor(private cartasService: CartasService, private router: Router) {}

  ngOnInit(): void {
    this.iniciarJuego();
  }

  cartaVolteada: boolean = false;

girarCarta() {
  this.cartaVolteada = !this.cartaVolteada;
}


  iniciarJuego() {
    this.cartasService.crearMazo().subscribe(response => {
      this.deckId = response.deck_id;
      this.sacarCarta();
      this.puntaje = 0;
      this.mensaje = '';
      this.juegoTerminado = false;
    });
  }

  sacarCarta() {
    this.cartasService.sacarCarta(this.deckId).subscribe(response => {
      if (response.cards.length > 0) {
        this.cartaActual = response.cards[0];
      } else {
        this.mensaje = '🏆 No quedan más cartas, ganaste!';
        this.juegoTerminado = true;
      }
    });
  }

  elegir(opcion: 'mayor' | 'menor') {
    const valorAnterior = this.obtenerValorCarta(this.cartaActual.value);

    this.cartasService.sacarCarta(this.deckId).subscribe(response => {
      const nuevaCarta = response.cards[0];
      const valorNuevo = this.obtenerValorCarta(nuevaCarta.value);

      if ((opcion === 'mayor' && valorNuevo > valorAnterior) ||
          (opcion === 'menor' && valorNuevo < valorAnterior)) {
        this.puntaje++;
        this.cartaActual = nuevaCarta;
      } else {
        this.cartaActual = nuevaCarta; // <<< IMPORTANTE: mostrar igual la carta
        this.mensaje = '❌ Fallaste. Juego terminado.';
        this.juegoTerminado = true;
      }
    });
  }

  obtenerValorCarta(valor: string): number {
    switch (valor) {
      case 'ACE': return 14;
      case 'KING': return 13;
      case 'QUEEN': return 12;
      case 'JACK': return 11;
      default: return Number(valor);
    }
  }

  reiniciarJuego() {
    this.iniciarJuego();
  }

  volverMenu() {
    this.router.navigate(['/home']);
  }
}
