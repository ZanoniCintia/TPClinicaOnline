import { Component, OnInit } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-turnos-especialista',
  templateUrl: './turnos-especialista.component.html',
  styleUrls: ['./turnos-especialista.component.scss']
})
export class TurnosEspecialistaComponent implements OnInit {
  private supabase: SupabaseClient = createClient(environment.apiUrl, environment.publicAnonKey);
  turnos: any[] = [];
  turnosFiltrados: any[] = [];
  filtro = '';
  userId = '';
  modalVisible = false;
  modalTitulo = '';
  modalDescripcion = '';
  modalTurno: any = null;
  modalCallback: (input: string) => void = () => {};

  async ngOnInit() {
    const { data: { session } } = await this.supabase.auth.getSession();
    this.userId = session?.user?.id ?? '';

    const { data, error } = await this.supabase
      .from('turnos')
      .select(`
        *,
        usuario_paciente:usuarios!paciente_auth_id(authid, name, apellido)
      `)
      .eq('especialista_auth_id', this.userId);

    if (!error && data) {
      this.turnos = data;
      this.turnosFiltrados = data;
    }
  }
filtrar(tipo: 'especialidad' | 'paciente', valor: string) {
  if (!valor) {
    this.turnosFiltrados = this.turnos;
    return;
  }

  this.turnosFiltrados = this.turnos.filter(turno =>
    tipo === 'especialidad'
      ? turno.especialidad?.toLowerCase().includes(valor.toLowerCase())
      : (turno.usuario_paciente?.name + ' ' + turno.usuario_paciente?.apellido)
          .toLowerCase()
          .includes(valor.toLowerCase())
  );
}


  puedeCancelar(estado: string): boolean {
    return !['aceptado', 'realizado', 'rechazado'].includes(estado.toLowerCase());
  }

  puedeRechazar(estado: string): boolean {
    return !['aceptado', 'realizado', 'cancelado'].includes(estado.toLowerCase());
  }

  puedeAceptar(estado: string): boolean {
    return !['realizado', 'cancelado', 'rechazado'].includes(estado.toLowerCase());
  }

  puedeFinalizar(estado: string): boolean {
    return estado.toLowerCase() === 'aceptado';
  }

  abrirModal(titulo: string, descripcion: string, turno: any, callback: (valor: string) => void) {
    this.modalTitulo = titulo;
    this.modalDescripcion = descripcion;
    this.modalTurno = turno;
    this.modalCallback = callback;
    this.modalVisible = true;
  }

  onModalAceptar(valor: string) {
    this.modalVisible = false;
    this.modalCallback(valor);
  }

  onModalCancelar() {
    this.modalVisible = false;
  }

  abrirCancelacion(turno: any) {
    this.abrirModal('Cancelar Turno', 'Ingrese motivo de cancelación:', turno, async (motivo) => {
      await this.actualizarTurno(turno.id, { estado: 'cancelado', comentario_cancelacion: motivo });
    });
  }

  abrirRechazo(turno: any) {
    this.abrirModal('Rechazar Turno', 'Ingrese motivo de rechazo:', turno, async (motivo) => {
      await this.actualizarTurno(turno.id, { estado: 'rechazado', comentario_cancelacion: motivo });
    });
  }

  aceptarTurno(turno: any) {
    this.actualizarTurno(turno.id, { estado: 'aceptado' });
  }

  abrirFinalizar(turno: any) {
    this.abrirModal('Finalizar Turno', 'Ingrese diagnóstico o comentario:', turno, async (comentario) => {
      await this.actualizarTurno(turno.id, { estado: 'realizado', resena: comentario });
    });
  }

  async actualizarTurno(id: string, campos: any) {
    const { error } = await this.supabase
      .from('turnos')
      .update(campos)
      .eq('id', id);

    if (!error) {
      const { data } = await this.supabase
        .from('turnos')
        .select(`*, usuario_paciente:usuarios!paciente_auth_id(authid, name, apellido)`)
        .eq('especialista_auth_id', this.userId);
        
      this.turnos = data ?? [];
      this.turnosFiltrados = data ?? [];
    }
  }

  verResena(resena: string) {
    alert(`📝 Reseña del turno: ${resena}`);
  }
}
