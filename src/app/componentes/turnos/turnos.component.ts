import { Component, OnInit } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Component({
  standalone:false,
  selector: 'app-turnos',
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.scss']
})
export class TurnosComponent implements OnInit {
  private supabase: SupabaseClient = createClient(environment.apiUrl, environment.publicAnonKey);

  turnos: any[] = [];
  turnosFiltrados: any[] = [];

  turnoSeleccionado: any = null;
  motivoCancelacion: string = '';
  mostrarModal = false;
  modalTitulo = '';
  modalDescripcion = '';
  modalCallback: (valor: string) => void = () => {};
  modalTurno: any = null;

  constructor() {}

  async ngOnInit() {

  const { data, error } = await this.supabase
  .from('turnos')
  .select(`
    *,
    usuario_paciente:usuarios!paciente_auth_id(authid, name, apellido),
    usuario_especialista:usuarios!especialista_auth_id(authid, name, apellido)
  `);

  

    if (!error && data) {
      this.turnos = data;
      this.turnosFiltrados = data;
    }
  }

 filtrar(campo: 'especialidad' | 'especialista', valor: string) {
  if (!valor) {
    this.turnosFiltrados = this.turnos;
    return;
  }

  this.turnosFiltrados = this.turnos.filter(t =>
    t[campo]?.toLowerCase().includes(valor.toLowerCase())
  );
}


  puedeCancelar(estado: string): boolean {
    return !['aceptado', 'realizado', 'rechazado'].includes(estado.toLowerCase());
  }

 

 async confirmarCancelacion() {
  if (!this.turnoSeleccionado || !this.motivoCancelacion) return;

  console.log("Turno a cancelar:", this.turnoSeleccionado);

  const { error } = await this.supabase
    .from('turnos')
    .update({
      estado: 'cancelado',
      comentario_cancelacion: this.motivoCancelacion
    })
    .eq('id', this.turnoSeleccionado.id);

  if (!error) {
    // Refrescar estado local del turno
    this.turnoSeleccionado.estado = 'cancelado';
    this.turnoSeleccionado.comentario_cancelacion = this.motivoCancelacion;
    this.turnoSeleccionado = null;
  } else {
    console.error("Error al cancelar turno:", error.message);
  }
}

abrirModal(titulo: string, descripcion: string, turno: any, callback: (valor: string) => void) {
  this.modalTitulo = titulo;
  this.modalDescripcion = descripcion;
  this.modalTurno = turno;
  this.modalCallback = callback;
  this.mostrarModal = true;
}

onModalAceptar(valor: string) {
  this.mostrarModal = false;
  this.modalCallback(valor);
}

onModalCancelar() {
  this.mostrarModal = false;
}

abrirCancelacion(turno: any) {
  this.turnoSeleccionado = turno;
  this.abrirModal(
    'Cancelar turno',
    'Ingrese el motivo de cancelación:',
    turno,
    async (motivo: string) => {
      const { error } = await this.supabase
        .from('turnos')
        .update({
          estado: 'cancelado',
          comentario_cancelacion: motivo
        })
        .eq('id', turno.id);

      if (!error) {
        // Volvemos a traer turnos con los JOIN necesarios
        const { data: turnosActualizados, error: fetchError } = await this.supabase
          .from('turnos')
          .select(`
            *,
            usuario_paciente:usuarios!paciente_auth_id(authid, name, apellido),
            usuario_especialista:usuarios!especialista_auth_id(authid, name, apellido)
          `);

        if (!fetchError && turnosActualizados) {
          this.turnos = turnosActualizados;
          this.turnosFiltrados = turnosActualizados;
        }

        this.turnoSeleccionado = null;
      }
    }
  );
}

}
