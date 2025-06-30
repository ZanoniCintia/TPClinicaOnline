import { Component, OnInit } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Router } from '@angular/router';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  standalone: false,
  selector: 'app-mi-perfil',
  templateUrl: './miperfil.component.html',
  styleUrls: ['./miperfil.component.scss']
})
export class MiPerfilComponent implements OnInit {
  [x: string]: any;
  usuario: any = {};
  especialidades: any[] = [];
  horarios: any[] = [];
  turnos: any[] = [];
  historiaClinicas: any[] = [];

  diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  nuevoDia = '';
  nuevaHoraInicio = '';
  nuevaHoraFin = '';
  mensaje = '';
  error = '';
 constructor(private router: Router) {}

  async ngOnInit() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('authid', user?.id)
      .single();

    this.usuario = data;

    const { data: especialidades } = await supabase
      .from('especialista_especialidad')
      .select('especialidades(nombre)')
      .eq('auth_id', user?.id);

    this.especialidades = (especialidades ?? []).map(e => e.especialidades);
    await this.cargarTurnos();
    this.cargarHorarios();

  }



  async cargarHorarios() {
    const { data } = await supabase
      .from('horarios')
      .select('*')
      .eq('auth_id', this.usuario.authid);
    this.horarios = data || [];
  }

  get diasDisponibles(): string[] {
    return this.diasSemana.filter(d => !this.horarios.some(h => h.dia === d));
  }

  async agregarHorario() {
    this.mensaje = '';
    this.error = '';

    if (!this.nuevoDia || !this.nuevaHoraInicio || !this.nuevaHoraFin) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }

    // Validar día duplicado
    const yaExiste = this.horarios.some(h => h.dia === this.nuevoDia);
    if (yaExiste) {
      this.error = 'Ya existe un horario registrado para ese día';
      return;
    }

    // Validar franja horaria permitida
    const hIni = parseInt(this.nuevaHoraInicio.split(':')[0], 10);
    const hFin = parseInt(this.nuevaHoraFin.split(':')[0], 10);
    if (this.nuevoDia === 'sábado' && (hIni < 8 || hFin > 14)) {
      this.error = 'Horario fuera del rango permitido para sábado (08 a 14)';
      return;
    } else if (this.nuevoDia !== 'sábado' && (hIni < 8 || hFin > 19)) {
      this.error = 'Horario fuera del rango permitido (08 a 19)';
      return;
    }

    const { error } = await supabase.from('horarios').insert({
      auth_id: this.usuario.authid,
      dia: this.nuevoDia,
      hora_inicio: this.nuevaHoraInicio,
      hora_fin: this.nuevaHoraFin
    });

    if (error) {
      this.error = 'Error al guardar el horario';
    } else {
      this.mensaje = 'Horario agregado correctamente';
      this.nuevoDia = '';
      this.nuevaHoraInicio = '';
      this.nuevaHoraFin = '';
      this.cargarHorarios();
    }
  }

  async eliminarHorario(horarioId: number) {
    await supabase.from('horarios').delete().eq('id', horarioId);
    this.cargarHorarios();
  }

  async guardarEdicionHorario(horario: any) {
    this.mensaje = '';
    this.error = '';

    const hIni = parseInt(horario.hora_inicio.split(':')[0], 10);
    const hFin = parseInt(horario.hora_fin.split(':')[0], 10);

    if (horario.dia === 'sábado' && (hIni < 8 || hFin > 14)) {
      this.error = 'Horario fuera del rango permitido para sábado (08 a 14)';
      return;
    } else if (horario.dia !== 'sábado' && (hIni < 8 || hFin > 19)) {
      this.error = 'Horario fuera del rango permitido (08 a 19)';
      return;
    }

    const { error } = await supabase
      .from('horarios')
      .update({ hora_inicio: horario.hora_inicio, hora_fin: horario.hora_fin })
      .eq('id', horario.id);

    if (error) {
      this.error = 'Error al actualizar el horario';
    } else {
      horario.editando = false;
      this.mensaje = 'Horario actualizado correctamente';
    }
  }

  horariosDelDia(dia: string) {
    return this.horarios.filter(h => h.dia === dia);
  }

  async descargarExcelTurnos() {
  const ws = XLSX.utils.json_to_sheet(this.turnos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Turnos');
  XLSX.writeFile(wb, 'mis_turnos.xlsx');
}

async descargarExcelHC() {
  const { data } = await supabase
    .from('historia_clinica')
    .select('*')
    .eq('paciente_auth_id', this.usuario.authid);

  const ws = XLSX.utils.json_to_sheet(data ?? []);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'HistoriaClinica');
  XLSX.writeFile(wb, 'mi_historia_clinica.xlsx');
}

  async cargarHistorias() {
  const { data, error } = await supabase
    .from('historia_clinica')
    .select('turno_id, altura, peso, temperatura, presion, datos_dinamicos');

  this.historiaClinicas = data ?? [];
}
async cargarTurnos() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase
    .from('turnos')
    .select('*')
    .eq('paciente_auth_id', user?.id);

  this.turnos = data ?? [];
}

irAMisPacientes() {
  this.router.navigate(['/mis-pacientes']);
}

}
