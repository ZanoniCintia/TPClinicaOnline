import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone:false,
  selector: 'app-modal-input',
  templateUrl: './modal-input.component.html',
  styleUrls: ['./modal-input.component.scss']
})
export class ModalInputComponent {
  @Input() titulo: string = '';
  @Input() descripcion: string = '';
  @Output() aceptar = new EventEmitter<string>();
  @Output() cancelar = new EventEmitter<void>();
  @Input() modoHistoriaClinica: boolean = false;
  @Input() modoConfirmacion: boolean = false;
  @Input() soloLectura: boolean = false;
  @Input() altura: number | null = null;
  @Input() peso: number | null = null;
  @Input() temperatura: number | null = null;
  @Input() presion: string = '';
  @Input() datosDinamicos: { clave: string, valor: string }[] = [];


  valor: string = '';

 /* altura: number | null = null;
  peso: number | null = null;
  temperatura: number | null = null;
  presion: string = '';

  datosDinamicos: { clave: string, valor: string }[] = [];*/

  @Output() guardar = new EventEmitter<any>();
  @Output() cerrar = new EventEmitter<void>();

agregarDato() {
  if (this.datosDinamicos.length < 3) {
    this.datosDinamicos.push({ clave: '', valor: '' });
  }
}

eliminarDato(index: number) {
  this.datosDinamicos.splice(index, 1);
}

  confirmar() {
    if (this.valor.trim()) {
      this.aceptar.emit(this.valor.trim());
    }
  }

/*  cerrar() {
    this.cancelar.emit();
  }*/
}
