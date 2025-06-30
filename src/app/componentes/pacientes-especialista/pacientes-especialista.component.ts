import { Component, OnInit } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';


@Component({
  standalone:false,
  selector: 'app-pacientes-especialista',
  templateUrl: './pacientes-especialista.component.html',
  styleUrls: ['./pacientes-especialista.component.scss']
})
export class PacientesEspecialistaComponent implements OnInit {
  private supabase: SupabaseClient = createClient(environment.apiUrl, environment.publicAnonKey);
  pacientes: any[] = [];

  constructor(private router: Router) {}

  async ngOnInit() {
     
console.log('🚀 Componente PacientesEspecialistaComponent cargado');
    const { data: userSession } = await this.supabase.auth.getUser();
    const especialistaId = userSession?.user?.id;
    if (!especialistaId) return;

    // Obtener todos los turnos atendidos por el especialista
    const { data: turnos, error } = await this.supabase
      .from('turnos')
      .select('paciente_auth_id, fecha')
      .eq('especialista_auth_id', especialistaId)
      .order('fecha', { ascending: false });

    if (error || !turnos?.length) return;

    // Agrupar por paciente y tomar últimos 3 turnos
    const mapaPacientes = new Map<string, string[]>();
    for (const turno of turnos) {
      const id = turno.paciente_auth_id;
      if (!mapaPacientes.has(id)) {
        mapaPacientes.set(id, []);
      }
      const fechas = mapaPacientes.get(id);
      if (fechas && fechas.length < 3) {
        fechas.push(turno.fecha);
      }
    }

    const pacientesFinal = [];

    for (const [idPaciente, ultimosTurnos] of mapaPacientes) {
      const { data: paciente } = await this.supabase
        .from('usuarios')
        .select('name, apellido, avatarurl')
        .eq('authid', idPaciente)
        .single();

      if (paciente) {
        pacientesFinal.push({
          id: idPaciente,
          nombre: paciente.name,
          apellido: paciente.apellido,
          avatarurl: paciente.avatarurl,
          turnos: ultimosTurnos
        });
      }
    }

    this.pacientes = pacientesFinal;
  }



  historiaClinica: any[] = [];
  mostrarModal = false;
  pacienteSeleccionado: string = '';

async verHistoriaClinica(pacienteId: string) {
  this.pacienteSeleccionado = pacienteId;
  const { data, error } = await this.supabase
    .from('historia_clinica')
    .select('*')
    .eq('paciente_auth_id', pacienteId)
    .order('fecha', { ascending: false });

  if (!error) {
    this.historiaClinica = data;
    this.mostrarModal = true;
  }
}

cerrarModal() {
  this.mostrarModal = false;
  this.historiaClinica = [];
}

}

