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
  userId = '';
  authUser: any;
  historiaClinicas: any[] = [];

  modalVisible = false;
  modalTitulo = '';
  modalDescripcion = '';
  modalTurno: any = null;
  modalCallback: (input: string) => void = () => {};

  modalAbierto = false;
  modoHistoriaClinica = false;
  soloLectura = false;
  turnoSeleccionado: any = null;
  modalHistoriaData: any = null;

  mensaje: string = '';
  errorMensaje: string = '';

  constructor(private router: Router) {}

  async ngOnInit() {
    const { data: { session } } = await this.supabase.auth.getSession();
    this.userId = session?.user?.id ?? '';
    this.authUser = session?.user;

    const { data, error } = await this.supabase
      .from('turnos')
      .select(`*, usuario_paciente:usuarios!paciente_auth_id(authid, name, apellido)`)
      .eq('especialista_auth_id', this.userId);

    if (!error && data) {
      this.turnos = data;
      this.turnosFiltrados = data;
    }

    await this.cargarHistorias();
  }

  async cargarHistorias() {
    const { data, error } = await this.supabase
      .from('historia_clinica')
      .select('turno_id, altura, peso, temperatura, presion, datos_dinamicos');

    if (!error && data) {
      this.historiaClinicas = data;
    } else {
      this.historiaClinicas = [];
    }
  }

  filtrarGlobal(valor: string) {
    valor = valor.toLowerCase();

    this.turnosFiltrados = this.turnos.filter(turno => {
      const paciente = `${turno.usuario_paciente?.name} ${turno.usuario_paciente?.apellido}`.toLowerCase();
      const especialidad = turno.especialidad?.toLowerCase() || '';
      const estado = turno.estado?.toLowerCase() || '';

      const datos = `${paciente} ${especialidad} ${estado} ${turno.fecha} ${turno.hora}`;

      const hc = this.historiaClinicas.find(h => String(h.turno_id) === String(turno.id));
      const hcTexto = hc
        ? `${hc.altura} ${hc.peso} ${hc.temperatura} ${hc.presion} ` +
          (hc.datos_dinamicos?.map((d: any) => `${d.clave} ${d.valor}`).join(' ') || '')
        : '';

      return (datos + ' ' + hcTexto).toLowerCase().includes(valor);
    });
  }

  irAMiPerfil() {
    this.router.navigate(['/mi-perfil']);
  }

  puedeVerAcciones(estado: string): boolean {
    return !['cancelado', 'rechazado', 'realizado'].includes(estado.toLowerCase());
  }
  puedeCancelar(estado: string): boolean { return estado.toLowerCase() === 'pendiente'; }
  puedeRechazar(estado: string): boolean { return estado.toLowerCase() === 'pendiente'; }
  puedeAceptar(estado: string): boolean { return estado.toLowerCase() === 'pendiente'; }
  puedeFinalizar(estado: string): boolean { return estado.toLowerCase() === 'aceptado'; }

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
    }
  }

  abrirModalHistoriaClinica(turno: any) {
    this.turnoSeleccionado = turno;
    this.modalAbierto = true;
    this.modoHistoriaClinica = true;
    this.soloLectura = false;
    this.modalHistoriaData = {
      altura: null,
      peso: null,
      temperatura: null,
      presion: '',
      datosDinamicos: []
    };
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.modoHistoriaClinica = false;
    this.soloLectura = false;
    this.modalHistoriaData = null;
  }

  async guardarHistoriaClinica(datos: any) {
    if (!this.turnoSeleccionado) return;

    const { error } = await this.supabase.from('historia_clinica').insert({
      turno_id: this.turnoSeleccionado.id,
      paciente_auth_id: this.turnoSeleccionado.paciente_auth_id,
      especialista_auth_id: this.authUser.id,
      altura: datos.altura,
      peso: datos.peso,
      temperatura: datos.temperatura,
      presion: datos.presion,
      datos_dinamicos: datos.datosDinamicos
    });

    if (!error) {
      this.mensaje = '✅ Historia clínica guardada con éxito.';
      await this.cargarHistorias();
    } else {
      this.errorMensaje = '❌ Error al guardar historia clínica: ' + error.message;
    }

    this.cerrarModal();
  }

  tieneHistoriaClinica(turnoId: string): boolean {
    return this.historiaClinicas.some(h => String(h.turno_id) === String(turnoId));
  }

  async verHistoriaClinica(turno: any) {
    const { data, error } = await this.supabase
      .from('historia_clinica')
      .select('altura, peso, temperatura, presion, datos_dinamicos')
      .eq('turno_id', turno.id)
      .maybeSingle();

    if (!data || error) {
      this.errorMensaje = 'No se pudo cargar la historia clínica.';
      return;
    }

    this.turnoSeleccionado = turno;
    this.modalAbierto = true;
    this.modoHistoriaClinica = true;
    this.soloLectura = true;

    this.modalHistoriaData = {
      altura: data.altura,
      peso: data.peso,
      temperatura: data.temperatura,
      presion: data.presion,
      datosDinamicos: data.datos_dinamicos ?? []
    };
  }
}
