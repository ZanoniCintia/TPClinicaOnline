import { Component, OnInit } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

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


  constructor(private router: Router) {}
  async ngOnInit() {
    const { data: { session } } = await this.supabase.auth.getSession();
    this.userId = session?.user?.id ?? '';

    const { data, error } = await this.supabase
      .from('turnos')
      .select(`*, usuario_paciente:usuarios!paciente_auth_id(authid, name, apellido)`)
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

  puedeVerAcciones(estado: string): boolean {
    return !['cancelado', 'rechazado', 'realizado'].includes(estado.toLowerCase());
  }

  puedeCancelar(estado: string): boolean {
    return estado.toLowerCase() === 'pendiente';
  }

  puedeRechazar(estado: string): boolean {
    return estado.toLowerCase() === 'pendiente';
  }

  puedeAceptar(estado: string): boolean {
    return estado.toLowerCase() === 'pendiente';
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

  verResena(resena: string) {
    this.abrirModal('Reseña del Turno', resena, null, () => {});
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
    } else {
      console.error('Error actualizando turno:', error);
    }
  }

  
irAMiPerfil() {
  this.router.navigate(['/mi-perfil']);
}
}
