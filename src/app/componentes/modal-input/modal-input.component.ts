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
  valor: string = '';

  confirmar() {
    if (this.valor.trim()) {
      this.aceptar.emit(this.valor.trim());
    }
  }

  cerrar() {
    this.cancelar.emit();
  }
}
