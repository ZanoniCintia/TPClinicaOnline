import { Component, OnInit } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  standalone: false,
  selector: 'app-solicitar-turno',
  templateUrl: './solicitar-turno.component.html',
  styleUrls: ['./solicitar-turno.component.scss']
})
export class SolicitarTurnoComponent implements OnInit {
  especialistas: any[] = [];
  especialidades: any[] = [];
  horariosDisponibles: { hora: string, ocupado: boolean }[] = [];

  horariosOcupados: string[] = [];

  especialistaSeleccionadoId = '';
  profesionalSeleccionado: any = null;
  especialidadSeleccionada = '';
  especialidadSeleccionadaId = '';
  fechaSeleccionada = '';
  horarioSeleccionado = '';
  pacienteEmail = '';
  mensaje = '';
  error = '';
  userName = '';
  avatarUrl = '';
  esAdmin = false;
  pacientesDisponibles: any[] = [];
  pacienteSeleccionadoId = '';
  pacienteId = '';
  fechasDisponibles: string[] = [];
  cargando = false;
  diasConTurnos: string[] = [];
  diaSeleccionado = '';

  async ngOnInit() {
    const { data: { user } } = await supabase.auth.getUser();
    this.pacienteEmail = user?.email ?? '';
    this.pacienteId = user?.id ?? '';
    const rol = user?.user_metadata?.['role'] || '';
    this.esAdmin = rol === 'admin';

    if (this.esAdmin) {
      const { data: pacientes } = await supabase
        .from('usuarios')
        .select('authid, name, apellido, email')
        .eq('rol', 'paciente');
      this.pacientesDisponibles = pacientes ?? [];
    }

    if (user) {
      this.userName = user.user_metadata?.['name'] || 'Usuario';
      this.avatarUrl = user.user_metadata?.['avatar_url'] || '';
    }

    const { data: especialistasRaw } = await supabase
      .from('usuarios')
      .select('authid, name, apellido, avatarurl')
      .eq('rol', 'especialista');

    this.especialistas = especialistasRaw ?? [];
  }

  logout() {
    supabase.auth.signOut().then(() => {
      window.location.href = '/';
    });
  }

  seleccionarProfesional(esp: any) {
    this.especialistaSeleccionadoId = esp.authid;
    this.profesionalSeleccionado = esp;
    this.resetearTodo();
    this.cargarEspecialidadesDelProfesional();
  }

  resetearTodo() {
    this.especialidadSeleccionada = '';
    this.especialidadSeleccionadaId = '';
    this.diaSeleccionado = '';
    this.fechaSeleccionada = '';
    this.fechasDisponibles = [];
    this.horariosDisponibles = [];
    this.diasConTurnos = [];
    this.mensaje = '';
    this.error = '';
    this.horarioSeleccionado = '';
  }

  async cargarEspecialidadesDelProfesional() {
    if (!this.profesionalSeleccionado) return;

    const { data, error } = await supabase
      .from('especialista_especialidad')
      .select(`
        especialidad_id,
        especialidades:especialidades (
          nombre,
          imagen
        )
      `)
      .eq('auth_id', this.profesionalSeleccionado.authid);

    if (error) {
      this.error = 'Error al cargar especialidades.';
      return;
    }

    this.especialidades = (data ?? []).map((d: any) => ({
      id: d.especialidad_id,
      nombre: d.especialidades?.nombre ?? '',
      imagen: d.especialidades?.imagen ?? ''
    }));

    this.resetearTodo();
  }

  async cargarDiasDelEspecialista() {
    this.diasConTurnos = [];
    this.fechasDisponibles = [];
    this.diaSeleccionado = '';
    this.horariosDisponibles = [];
    this.error = '';

    const { data, error } = await supabase
      .from('horarios')
      .select('dia')
      .eq('auth_id', this.especialistaSeleccionadoId)
      .eq('especialidad_id', this.especialidadSeleccionadaId);

    if (error) {
      this.error = 'Error al cargar días disponibles';
      return;
    }

    if (data) {
      const diasUnicos = [...new Set(data.map(d => d.dia.toLowerCase()))];
      this.diasConTurnos = diasUnicos;
    }
  }

  obtenerFechasPorDiaSemana(diaNombre: string) {
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const indiceDia = diasSemana.indexOf(diaNombre.toLowerCase());

    const hoy = new Date();
    const fechasCoincidentes: string[] = [];

    for (let i = 0; i < 15; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);

      if (fecha.getDay() === indiceDia) {
        fechasCoincidentes.push(fecha.toISOString().split('T')[0]);
      }
    }

    this.fechasDisponibles = fechasCoincidentes;
  }

  async onDiaSeleccionado(dia: string) {
    this.diaSeleccionado = dia;
    this.obtenerFechasPorDiaSemana(dia);
    this.fechaSeleccionada = '';
    this.horariosDisponibles = [];
  }

  async cargarHorariosDisponibles() {
    this.horariosDisponibles = [];
    this.error = '';

    if (!this.especialistaSeleccionadoId || !this.fechaSeleccionada || !this.especialidadSeleccionadaId) return;

    const fechaObj = new Date(this.fechaSeleccionada);
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const diaTexto = diasSemana[fechaObj.getDay()];

    const { data: rangos, error: errorHorarios } = await supabase
      .from('horarios')
      .select('*')
      .eq('auth_id', this.especialistaSeleccionadoId)
      .eq('especialidad_id', this.especialidadSeleccionadaId)
      .eq('dia', diaTexto);

    if (errorHorarios) {
      this.error = 'Error al cargar horarios.';
      return;
    }

    if (!rangos?.length) {
      this.error = 'Este profesional no atiende el día seleccionado.';
      return;
    }

    const { data: turnosTomados } = await supabase
      .from('turnos')
      .select('hora')
      .eq('fecha', this.fechaSeleccionada)
      .eq('especialista_auth_id', this.especialistaSeleccionadoId)
      .neq('estado', 'cancelado');

    const horasOcupadas = turnosTomados?.map(t => t.hora.slice(0, 5)) || [];

    


    const generarIntervalos = (inicio: string, fin: string) => {
      const resultado = [];
      let [h, m] = inicio.split(':').map(Number);
      const [hFin, mFin] = fin.split(':').map(Number);

      while (h < hFin || (h === hFin && m < mFin)) {
        const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        resultado.push(hora);
        m += 30;
        if (m >= 60) {
          h++;
          m = 0;
        }
      }

      return resultado;
    };

   let posibles: string[] = [];
rangos.forEach(r => {
  posibles.push(...generarIntervalos(r.hora_inicio, r.hora_fin));
});

// Genera objetos con `hora` y si está ocupada o no
this.horariosDisponibles = posibles.map(hora => ({
  hora,
  ocupado: horasOcupadas.includes(hora)
}));


  }

  async solicitarTurno() {
    this.mensaje = '';
    this.error = '';
    this.cargando = true;

    const especialistaEmail = this.profesionalSeleccionado?.email || '';
    if (!this.especialidadSeleccionadaId || !this.especialistaSeleccionadoId || !this.fechaSeleccionada || !this.horarioSeleccionado) {
      this.error = 'Por favor, completá todos los campos requeridos.';
      this.cargando = false;
      return;
    }

    if (this.esAdmin && !this.pacienteSeleccionadoId) {
      this.error = 'Por favor, seleccioná un paciente.';
      this.cargando = false;
      return;
    }

    const pacienteIdFinal = this.esAdmin ? this.pacienteSeleccionadoId : this.pacienteId;
    const pacienteEmailFinal = this.esAdmin
      ? this.pacientesDisponibles.find(p => p.authid === this.pacienteSeleccionadoId)?.email || ''
      : this.pacienteEmail;

    const { error } = await supabase.from('turnos').insert({
      paciente_auth_id: pacienteIdFinal,
      paciente_email: pacienteEmailFinal,
      especialista_auth_id: this.especialistaSeleccionadoId,
      especialista_id: this.especialistaSeleccionadoId,
      especialidad: this.especialidadSeleccionada,
      especialista_email: especialistaEmail,
      fecha: this.fechaSeleccionada,
      hora: this.horarioSeleccionado,
      estado: 'pendiente'
    });

    this.cargando = false;

    if (error) {
      this.error = 'Error al solicitar el turno.';
    } else {
      this.mensaje = 'Turno solicitado con éxito.';
      this.pacienteSeleccionadoId = '';
      this.horarioSeleccionado = '';
    }
  }

  onFechaSeleccionada(fecha: string) {
  this.fechaSeleccionada = fecha;
  this.horarioSeleccionado = '';
  this.cargarHorariosDisponibles(); // Refresca al instante
}

}
