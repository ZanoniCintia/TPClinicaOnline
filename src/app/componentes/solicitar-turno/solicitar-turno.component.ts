import { Component, OnInit } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  standalone:false,
  selector: 'app-solicitar-turno',
  templateUrl: './solicitar-turno.component.html',
  styleUrls: ['./solicitar-turno.component.scss']
})
export class SolicitarTurnoComponent implements OnInit {
  especialidades: string[] = [];
  especialistas: any[] = [];
  horariosDisponibles: string[] = [];
  
  especialidadSeleccionada = '';
  especialistaSeleccionadoId = '';
  fechaSeleccionada = '';
  horarioSeleccionado = '';
  pacienteEmail='';
  mensaje = '';
  error = '';
  userName: string = '';
  avatarUrl: string = '';
  esAdmin: boolean = false;
  pacientesDisponibles: any[] = [];
  pacienteSeleccionadoId: string = ''; // usado solo si es admin


  cargando: boolean = false;
  pacienteId = ''; 
  router: any;
  fechasDisponibles: string[] = [];

generarFechasDisponibles() {
  const hoy = new Date();
  for (let i = 0; i < 15; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    this.fechasDisponibles.push(fecha.toISOString().split('T')[0]);
  }
}

async ngOnInit() {

    
  this.generarFechasDisponibles();

  const { data: { user } } = await supabase.auth.getUser();
  this.pacienteEmail = user?.email ?? ''; 
  this.pacienteId = user?.id ?? '';

  // Detectar si el usuario es administrador
  const rol = user?.user_metadata?.['role'] || '';
  this.esAdmin = rol === 'admin';

  if (this.esAdmin) {
    const { data: pacientes, error: errorPacientes } = await supabase
      .from('usuarios')
      .select('auth_id, name, apellido, email')
      .eq('rol', 'paciente');

    if (!errorPacientes && pacientes) {
      this.pacientesDisponibles = pacientes;
    } else {
      console.error('Error cargando pacientes:', errorPacientes);
    }
  }

  // Cargar especialidades
  const { data, error } = await supabase.from('especialidades').select('nombre');
  if (!error && data) {
    this.especialidades = data.map((e: any) => e.nombre);
  }

  if (user) {
    this.userName = user.user_metadata?.['name'] || 'Usuario';
    this.avatarUrl = user.user_metadata?.['avatar_url'] || '';
  }
  }
  
  
 logout() {
    supabase.auth.signOut().then(() => {
      window.location.href = '/';
    });
  }
async cargarEspecialistas() {
  this.error = '';
  this.especialistas = [];

  const { data, error } = await supabase
    .from('especialista_especialidad')
    .select(`
      auth_id,
      usuarios (
        name,
        apellido,
        email
      ),
      especialidades (
        nombre
      )
    `);

  

  if (!error && data) {
    const usuariosUnicos = new Map<string, any>();

    for (const rel of data) {
      const user = Array.isArray(rel.usuarios) ? rel.usuarios[0] : rel.usuarios;
      const especialidad = Array.isArray(rel.especialidades) ? rel.especialidades[0] : rel.especialidades;

      const nombreEspecialidad = especialidad?.nombre;
      const userId = rel.auth_id;

      if (
        nombreEspecialidad &&
        typeof nombreEspecialidad === 'string' &&
        nombreEspecialidad.toLowerCase() === this.especialidadSeleccionada.toLowerCase() &&
        userId &&
        !usuariosUnicos.has(userId)
      ) {
        usuariosUnicos.set(userId, {
          id: userId, // UUID real
          nombre: user?.name,
          apellido: user?.apellido,
          email: user.email 
        });
      }
    }

    this.especialistas = Array.from(usuariosUnicos.values());
  } else {
    console.error('Error cargando especialistas:', error);
    this.error = 'No se pudieron cargar los especialistas.';
  }
}


todosLosHorarios: string[] = [
  '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
  '18:00'
];



async cargarHorariosDisponibles() {
  this.horariosDisponibles = [];

  if (!this.especialistaSeleccionadoId || !this.fechaSeleccionada) return;

  const { data: turnosTomados, error } = await supabase
    .from('turnos')
    .select('fecha')
    .eq('especialista_id', this.especialistaSeleccionadoId);

  if (error) {
    console.error('Error cargando horarios:', error);
    this.error = 'No se pudieron cargar los horarios.';
    return;
  }

  
  const horasOcupadas = turnosTomados
    .filter((t: any) => t.fecha.startsWith(this.fechaSeleccionada))
    .map((t: any) => t.fecha.split('T')[1].substring(0, 5)); // "HH:MM"

  this.horariosDisponibles = this.todosLosHorarios.filter(h => !horasOcupadas.includes(h));
}
fechaHoy = new Date().toISOString().split('T')[0];

onEspecialistaChange() {
  this.cargarHorariosDisponibles();
}

async onFechaChange() {
  if (!this.fechaSeleccionada || !this.especialistaSeleccionadoId) return;

const [anio, mes, dia] = this.fechaSeleccionada.split('-').map(Number);
const fecha = new Date(anio, mes - 1, dia);
const diaSemana = fecha.getDay();

if (diaSemana === 0) {
  this.horariosDisponibles = [];
  this.error = 'No se pueden solicitar turnos los domingos.';
  return;
}





  
  const horariosLunesAViernes = [
    '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30',
    '18:00'
  ];

  const horariosSabado = [
    '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30',
    '14:00'
  ];

  this.horariosDisponibles = diaSemana === 6 ? horariosSabado : horariosLunesAViernes;


  const { data: turnosTomados, error } = await supabase
    .from('turnos')
    .select('hora')
    .eq('fecha', this.fechaSeleccionada)
    .eq('especialista_auth_id', this.especialistaSeleccionadoId);

  const horasOcupadas = turnosTomados?.map(t => t.hora.slice(0, 5)) || [];

 
  this.horariosDisponibles = this.horariosDisponibles.filter(
    hora => !horasOcupadas.includes(hora)
  );
}




  //cargando = false; // Para mostrar el spinner

async solicitarTurno() {
  this.mensaje = '';
  this.error = '';
  this.cargando = true;

  const especialista = this.especialistas.find(e => e.id === this.especialistaSeleccionadoId);
  const especialistaEmail = especialista?.email || '';

  if (!this.especialidadSeleccionada || !this.especialistaSeleccionadoId || !this.fechaSeleccionada || !this.horarioSeleccionado) {
    this.error = 'Por favor, completá todos los campos requeridos.';
    this.cargando = false;
    return;
  }

  // ⚠️ Si es admin, debe seleccionar paciente
  if (this.esAdmin && !this.pacienteSeleccionadoId) {
    this.error = 'Por favor, seleccioná un paciente.';
    this.cargando = false;
    return;
  }

  const pacienteIdFinal = this.esAdmin ? this.pacienteSeleccionadoId : this.pacienteId;
  const pacienteEmailFinal = this.esAdmin
    ? this.pacientesDisponibles.find(p => p.auth_id === this.pacienteSeleccionadoId)?.email || ''
    : this.pacienteEmail;

  const { error } = await supabase.from('turnos').insert({
    paciente_auth_id: pacienteIdFinal,
    paciente_email: pacienteEmailFinal,
    especialista_auth_id: this.especialistaSeleccionadoId,
    especialista_id: this.especialistaSeleccionadoId,  
    especialidad: this.especialidadSeleccionada,
    especialista_email: especialistaEmail,
    fecha: this.fechaSeleccionada, // YYYY-MM-DD
    hora: this.horarioSeleccionado,
    estado: 'pendiente'
  });

  this.cargando = false;

  if (error) {
    console.error('Error detallado:', error);
    this.error = 'Error al solicitar el turno.';
  } else {
    this.mensaje = 'Turno solicitado con éxito.';
    this.pacienteSeleccionadoId = ''; // reset si es admin
  }
}

}
