import { Component, OnInit } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  standalone:false,
  selector: 'app-miperfilpaciente',
  templateUrl: './miperfilpaciente.component.html',
  styleUrls: ['./miperfilpaciente.component.scss']
})
export class MiPerfilPacienteComponent implements OnInit {
  usuario: any = {};
  turnos: any[] = [];
  mensaje = '';
  error = '';
  defaultAvatar = 'https://okhubqbtmacszztmqiki.supabase.co/storage/v1/object/public/avatars/equipo-medico.png';

  especialidadSeleccionada = '';
  especialidadesDisponibles: string[] = []; // se completa desde historia_clinica

  async ngOnInit() {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: usuarioData } = await supabase
      .from('usuarios')
      .select('*')
      .eq('authid', user?.id)
      .single();

    this.usuario = usuarioData;

    const { data: turnos } = await supabase
      .from('turnos')
      .select('*')
      .eq('paciente_auth_id', user?.id)
      .order('fecha', { ascending: true });

    this.turnos = turnos ?? [];

    /*const { data: especialidades } = await supabase
      .from('historia_clinica')
      .select('especialidad')
      .eq('paciente_auth_id', user?.id);

    this.especialidadesDisponibles = [...new Set((especialidades ?? []).map(e => e.especialidad))];*/
    const { data: historia } = await supabase
  .from('historia_clinica')
  .select('turnos(especialidad)')
  .eq('paciente_auth_id', user?.id);

this.especialidadesDisponibles = [...new Set(
  (historia ?? [])
    .map((h: any) => h.turnos?.especialidad)
    .filter((e: any) => !!e)
)];

  }

  async cancelarTurno(turnoId: string) {
    const { error } = await supabase
      .from('turnos')
      .update({ estado: 'cancelado' })
      .eq('id', turnoId);

    if (error) {
      this.error = 'Error al cancelar el turno.';
    } else {
      this.mensaje = 'Turno cancelado exitosamente.';
      this.turnos = this.turnos.map(t => t.id === turnoId ? { ...t, estado: 'cancelado' } : t);
    }
  }

  async descargarExcelTurnos() {
  if (!this.turnos || this.turnos.length === 0) {
    this.error = 'No hay turnos para exportar.';
    return;
  }

  const datosLimpios = this.turnos.map(t => ({
    Fecha: t.fecha,
    Hora: t.hora,
    Estado: t.estado,
    Especialidad: t.especialidad,
    Comentario: t.comentario_resena,
    Calificación: t.calificacion,
  }));

  const wb = XLSX.utils.book_new();
  const hoja = XLSX.utils.json_to_sheet([]);

  const encabezado = [
    [`Turnos del paciente: ${this.usuario.name} ${this.usuario.apellido}`],
    [`DNI: ${this.usuario.dni} - Email: ${this.usuario.email}`],
    [],
  ];

  XLSX.utils.sheet_add_aoa(hoja, encabezado, { origin: 'A1' });
  XLSX.utils.sheet_add_json(hoja, datosLimpios, { origin: -1 });

  XLSX.utils.book_append_sheet(wb, hoja, 'Turnos');
  XLSX.writeFile(wb, 'mis_turnos.xlsx');
}


 async descargarExcelHC() {
  const { data } = await supabase
    .from('historia_clinica')
    .select('*')
    .eq('paciente_auth_id', this.usuario.authid);

  if (!data || data.length === 0) {
    this.error = 'No hay historia clínica registrada.';
    return;
  }

  const hcLimpia = data.map(entry => ({
    Fecha: new Date(entry.fecha).toLocaleDateString(),
    Especialidad: entry.especialidad,
    Altura: entry.altura,
    Peso: entry.peso,
    Temperatura: entry.temperatura,
    Presión: entry.presion,
    DatosExtra: entry.datos_dinamicos || '',
  }));

  const wb = XLSX.utils.book_new();
  const hoja = XLSX.utils.json_to_sheet([]);

  const encabezado = [
    [`Historia Clínica de: ${this.usuario.name} ${this.usuario.apellido}`],
    [`DNI: ${this.usuario.dni} - Email: ${this.usuario.email}`],
    [`Fecha de descarga: ${new Date().toLocaleDateString()}`],
    [],
  ];

  XLSX.utils.sheet_add_aoa(hoja, encabezado, { origin: 'A1' });
  XLSX.utils.sheet_add_json(hoja, hcLimpia, { origin: -1 });

  XLSX.utils.book_append_sheet(wb, hoja, 'HistoriaClínica');
  XLSX.writeFile(wb, 'mi_historia_clinica.xlsx');
}


 historiaFiltrada: any[] = [];
today = new Date();

async imprimirHistoria() {
  if (!this.especialidadSeleccionada) {
    this.error = 'Seleccioná una especialidad para continuar.';
    return;
  }

  const { data } = await supabase
    .from('historia_clinica')
    .select('*')
    .eq('paciente_auth_id', this.usuario.authid)
    .eq('especialidad', this.especialidadSeleccionada);

  this.historiaFiltrada = data ?? [];

  setTimeout(() => {
    const printContents = document.getElementById('printArea')?.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents || '';
    window.print();
    document.body.innerHTML = originalContents;

    window.location.reload();
  }, 500);
}

  
}