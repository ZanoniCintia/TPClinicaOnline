import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Chart from 'chart.js/auto';



@Component({
  standalone: false,
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  supabase: SupabaseClient;
  usuarios: any[] = [];
  @ViewChild('chartTurnosPorDia', { static: false }) chartDiaRef!: ElementRef<HTMLCanvasElement>;
chartDiaInstance: any = null;

  cargando: boolean = false;
  error = '';
  mensaje = '';

  emailNuevo = '';
  passNuevo = '';
  nombreNuevo = '';

  mostrarTurnosPorDia = false;
  mostrarTurnosPorMedico = false;
  mostrarTurnosFinalizados = false;
  mostrarFinalizadosPorMedico = false;

  turnosPorMedico: any[] = [];
  finalizadosPorMedico: any[] = [];
  turnosPorDia: any[] = [];
  turnosFinalizados: any[] = [];

  nuevoAdmin = {
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    edad: null,
    dni: ''
  };

  avatarFile: File | null = null;

  mostrarLogIngresos = false;
  mostrarTurnosEspecialidad = false;

  logs: any[] = [];
  turnosPorEspecialidad: any[] = [];

  @ViewChild('chartTurnosEspecialidad', { static: false }) chartRef!: ElementRef<HTMLCanvasElement>;
  chartInstance: any = null;

  @ViewChild('chartTurnosPorMedico', { static: false }) chartMedicoRef!: ElementRef<HTMLCanvasElement>;
  chartMedicoInstance: any = null;

  @ViewChild('chartFinalizadosPorMedico', { static: false }) chartFinalizadosRef!: ElementRef<HTMLCanvasElement>;
  chartFinalizadosInstance: any = null;



  constructor(private router: Router) {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  }

  async ngOnInit() {
    await this.cargarUsuarios();
  }

  async cargarUsuarios() {
    this.cargando = true;
    const { data, error } = await this.supabase.from('usuarios').select('*');
    if (error) {
      this.error = 'Error al cargar usuarios';
    } else {
      this.usuarios = data;
    }
    this.cargando = false;
  }

  seleccionarAvatar(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.avatarFile = file;
    }
  }

  async alternarEstado(usuario: any) {
    const nuevoEstado = !usuario.estado;
    const { error } = await this.supabase
      .from('usuarios')
      .update({ estado: nuevoEstado })
      .eq('authid', usuario.authid);

    if (!error) {
      usuario.estado = nuevoEstado;
    }
  }

  async crearUsuarioAdmin(email: string, password: string, nombre: string) {
    const { data: signup, error: signupError } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, rol: 'admin' } }
    });

    if (signupError || !signup.user?.id) {
      this.error = signupError?.message || 'No se pudo crear el admin';
      return;
    }

    await this.supabase.from('usuarios').insert({
      authid: signup.user.id,
      email,
      rol: 'admin',
      nombre,
      estado: true
    });

    this.cargarUsuarios();
  }

  async crearAdmin() {
    this.mensaje = '';
    this.error = '';

    const { email, password, nombre, apellido, edad, dni } = this.nuevoAdmin;

    if (!email || !password || !nombre || !apellido || !edad || !dni) {
      this.error = 'Todos los campos son obligatorios.';
      return;
    }

    const { data: authData, error: signupError } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre, apellido, rol: 'admin' }
      }
    });

    if (signupError || !authData.user?.id) {
      this.error = signupError?.message || 'Error creando usuario admin';
      return;
    }

    const userId = authData.user.id;

    let avatarUrl = '';
    if (this.avatarFile) {
      const fileName = `admin_${Date.now()}_${this.avatarFile.name}`;
      const { error: uploadError } = await this.supabase.storage.from('avatars').upload(fileName, this.avatarFile);
      if (uploadError) {
        this.error = 'Error al subir imagen.';
        return;
      }
      const { data: publicData } = this.supabase.storage.from('avatars').getPublicUrl(fileName);
      avatarUrl = publicData?.publicUrl || '';
    }

    const { error: insertError } = await this.supabase.from('usuarios').insert({
      authid: userId,
      email,
      nombre,
      apellido,
      edad,
      dni,
      rol: 'admin',
      avatarurl: avatarUrl,
      estado: true
    });

    if (insertError) {
      this.error = 'Error al guardar usuario en base de datos.';
      return;
    }

    this.mensaje = 'Administrador creado exitosamente ✅';
    this.nuevoAdmin = { email: '', password: '', nombre: '', apellido: '', edad: null, dni: '' };
    this.avatarFile = null;
    this.cargarUsuarios();
  }

  async logout() {
    const { error } = await this.supabase.auth.signOut();
    if (!error) this.router.navigate(['/login']);
  }

  irATurnos() {
    this.router.navigate(['/turnos']);
  }

  exportarUsuariosAExcel() {
    if (!this.usuarios.length) {
      this.error = 'No hay usuarios para exportar.';
      return;
    }

    const usuariosLimpios = this.usuarios.map(u => ({
      Nombre: u.nombre,
      Apellido: u.apellido,
      Email: u.email,
      DNI: u.dni,
      Edad: u.edad,
      Rol: u.rol,
      Estado: u.estado ? 'Activo' : 'Inactivo'
    }));

    const worksheet = XLSX.utils.json_to_sheet(usuariosLimpios);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

    const blob = new Blob(
      [XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })],
      { type: 'application/octet-stream' }
    );
    saveAs(blob, `usuarios_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  verLogIngresos() {
    this.resetVistas();
    this.mostrarLogIngresos = true;

    this.supabase.from('logs').select('*').order('fecha', { ascending: false }).then(({ data, error }) => {
      if (!error) this.logs = data;
      else console.error('Error cargando logs:', error);
    });
  }

  verTurnosPorEspecialidad() {
    this.resetVistas();
    this.mostrarTurnosEspecialidad = true;

    this.supabase.from('turnos').select('especialidad').then(({ data, error }) => {
      if (error || !data) {
        console.error('Error al obtener turnos:', error);
        return;
      }

      const conteo: { [key: string]: number } = {};
      data.forEach(t => { if (t.especialidad) conteo[t.especialidad] = (conteo[t.especialidad] || 0) + 1; });

      this.turnosPorEspecialidad = Object.entries(conteo).map(([especialidad, cantidad]) => ({ especialidad, cantidad }));

      setTimeout(() => this.generarGraficoTurnosPorEspecialidad(), 100);
    });
  }

  generarGraficoTurnosPorEspecialidad() {
    if (this.chartInstance) this.chartInstance.destroy();
    const ctx = this.chartRef?.nativeElement.getContext('2d');
    if (!ctx) return;

   this.chartInstance = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: this.turnosPorEspecialidad.map(e => e.especialidad),
    datasets: [{
      label: 'Cantidad de Turnos',
      data: this.turnosPorEspecialidad.map(e => e.cantidad),
      backgroundColor: 'rgba(54, 162, 235, 0.7)',
      borderRadius: 6,
      barThickness: 30
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      x: { ticks: { font: { size: 11 } } },
      y: { ticks: { stepSize: 1, font: { size: 11 } } }
    }
  }
});

  }

  descargarGrafico() {
    const link = document.createElement('a');
    link.download = `turnos_por_especialidad_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = this.chartRef.nativeElement.toDataURL('image/png');
    link.click();
  }

  generarGraficoTurnosPorDia() {
  if (this.chartDiaInstance) this.chartDiaInstance.destroy();
  const ctx = this.chartDiaRef?.nativeElement.getContext('2d');
  if (!ctx) return;

  const labels = this.turnosPorDia.map(t => t.fecha);
  const data = this.turnosPorDia.map(t => t.cantidad);

  this.chartDiaInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Turnos por Día',
        data,
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.3,
        pointBackgroundColor: 'red'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        x: { ticks: { font: { size: 11 } } },
        y: { ticks: { stepSize: 1, font: { size: 11 } } }
      }
    }
  });
}
descargarGraficoDia() {
  const link = document.createElement('a');
  link.download = `turnos_por_dia_${new Date().toISOString().slice(0, 10)}.png`;
  link.href = this.chartDiaRef.nativeElement.toDataURL('image/png');
  link.click();
}




  verTurnosPorDia() {
    this.resetVistas();
    this.mostrarTurnosPorDia = true;

    this.supabase.from('turnos').select('fecha').then(({ data, error }) => {
      if (error || !data) return console.error('Error turnos por día:', error);

      const conteo: { [fecha: string]: number } = {};
      for (const t of data) {
        const fechaStr = new Date(t.fecha).toISOString().split('T')[0];
        conteo[fechaStr] = (conteo[fechaStr] || 0) + 1;
      }

      this.turnosPorDia = Object.entries(conteo).map(([fecha, cantidad]) => ({ fecha, cantidad }));
      
    setTimeout(() => this.generarGraficoTurnosPorDia(), 100);
    
    });


  }

  getLineaTurnosPorDia(): string {
    return this.turnosPorDia.map((t, i) => `${i * 60 + 30},${300 - (t.cantidad * 10)}`).join(' ');
  }

generarGraficoTurnosPorMedico() {
  if (this.chartMedicoInstance) this.chartMedicoInstance.destroy();
  const ctx = this.chartMedicoRef?.nativeElement.getContext('2d');
  if (!ctx) return;

  const labels = this.turnosPorMedico.map(m => m.medico);
  const data = this.turnosPorMedico.map(m => m.cantidad);

  this.chartMedicoInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Turnos',
        data,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        x: { ticks: { stepSize: 1, font: { size: 11 } } },
        y: { ticks: { font: { size: 11 } } }
      }
    }
  });
}



 verTurnosPorMedico() {
  console.log('✅ verTurnosPorMedico ejecutado');
  this.resetVistas();
  this.mostrarTurnosPorMedico = true;

  this.supabase.from('turnos').select('especialista_auth_id').then(async ({ data, error }) => {
    if (error || !data) {
      console.error('❌ Error al obtener turnos por médico:', error);
      return;
    }

    const conteo: { [key: string]: number } = {};
    for (const t of data) {
      if (t.especialista_auth_id) {
        conteo[t.especialista_auth_id] = (conteo[t.especialista_auth_id] || 0) + 1;
      }
    }

    const ids = Object.keys(conteo);
    if (!ids.length) {
      console.warn('⚠️ No hay IDs de médicos con turnos');
      this.turnosPorMedico = [];
      return;
    }

    const { data: especialistas, error: errorEsp } = await this.supabase
      .from('usuarios')
      .select('authid, name, apellido')
      .in('authid', ids);

    if (errorEsp) {
      console.error('❌ Error cargando médicos:', errorEsp);
      return;
    }

    this.turnosPorMedico = (especialistas ?? []).map(e => ({
      medico: `${e.name} ${e.apellido}`,
      cantidad: conteo[e.authid]
    }));

    console.log('🧠 Médicos con turnos:', this.turnosPorMedico);

    setTimeout(() => this.generarGraficoTurnosPorMedico(), 100);
  });
}


  descargarGraficoMedico() {
  const link = document.createElement('a');
  link.download = `turnos_por_medico_${new Date().toISOString().slice(0, 10)}.png`;
  link.href = this.chartMedicoRef.nativeElement.toDataURL('image/png');
  link.click();
}


generarGraficoFinalizadosPorMedico() {
  if (this.chartFinalizadosInstance) this.chartFinalizadosInstance.destroy();
  const ctx = this.chartFinalizadosRef?.nativeElement.getContext('2d');
  if (!ctx) return;

  const labels = this.finalizadosPorMedico.map(m => m.medico);
  const data = this.finalizadosPorMedico.map(m => m.cantidad);

  this.chartFinalizadosInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Finalizados',
        data,
        backgroundColor: 'rgba(75, 192, 75, 0.6)',
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        x: { ticks: { stepSize: 1, font: { size: 11 } } },
        y: { ticks: { font: { size: 11 } } }
      }
    }
  });
}

descargarGraficoFinalizados() {
  const link = document.createElement('a');
  link.download = `finalizados_por_medico_${new Date().toISOString().slice(0, 10)}.png`;
  link.href = this.chartFinalizadosRef.nativeElement.toDataURL('image/png');
  link.click();
}



  verTurnosFinalizados() {
    this.resetVistas();
    this.mostrarFinalizadosPorMedico = true;

    this.supabase.from('turnos').select('especialista_auth_id').eq('estado', 'realizado').then(async ({ data, error }) => {
      if (error || !data) return console.error('Error obteniendo turnos finalizados:', error);

      const conteo: { [key: string]: number } = {};
      for (const t of data) conteo[t.especialista_auth_id] = (conteo[t.especialista_auth_id] || 0) + 1;

      const ids = Object.keys(conteo);
      const { data: especialistas, error: errorEsp } = await this.supabase
        .from('usuarios')
        .select('authid, name, apellido')
        .in('authid', ids);

      if (errorEsp) return console.error('Error cargando médicos:', errorEsp);

      this.finalizadosPorMedico = (especialistas ?? []).map(e => ({
        medico: `${e.name} ${e.apellido}`,
        cantidad: conteo[e.authid]
        
      }));
      setTimeout(() => this.generarGraficoFinalizadosPorMedico(), 100);

    });
  }

  exportarAExcel(data: any[], nombre: string) {
    const hoja = XLSX.utils.json_to_sheet(data);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, nombre);
    const blob = new Blob(
      [XLSX.write(libro, { bookType: 'xlsx', type: 'array' })],
      { type: 'application/octet-stream' }
    );
    saveAs(blob, `${nombre}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  resetVistas() {
    this.mostrarLogIngresos = false;
    this.mostrarTurnosEspecialidad = false;
    this.mostrarTurnosPorDia = false;
    this.mostrarTurnosPorMedico = false;
    this.mostrarTurnosFinalizados = false;
    this.mostrarFinalizadosPorMedico = false;
  }

  async descargarTurnosDelPaciente(pacienteId: string) {
  if (!pacienteId) {
    this.error = 'ID de paciente inválido.';
    return;
  }

  const { data: paciente, error: pacienteError } = await this.supabase
    .from('usuarios')
    .select('name, apellido')
    .eq('authid', pacienteId)
    .single();

  if (pacienteError || !paciente) {
    this.error = 'Error al obtener datos del paciente.';
    return;
  }

  const nombreCompletoPaciente = `${paciente.name} ${paciente.apellido}`;

  const { data: turnos, error } = await this.supabase
    .from('turnos')
    .select('fecha, hora, estado, especialidad, especialista_auth_id')
    .eq('paciente_auth_id', pacienteId);

  if (error || !turnos?.length) {
    this.error = 'No se encontraron turnos para este paciente.';
    return;
  }

  const especialistaIds = [...new Set(turnos.map(t => t.especialista_auth_id).filter(id => !!id))];
  let especialistasMap = new Map<string, string>();

  if (especialistaIds.length > 0) {
    const { data: especialistas } = await this.supabase
      .from('usuarios')
      .select('authid, name, apellido')
      .in('authid', especialistaIds);

    especialistasMap = new Map(
      (especialistas ?? []).map(e => [e.authid, `${e.name} ${e.apellido}`])
    );
  }

  const filas = turnos.map(t => ({
    Fecha: new Date(t.fecha).toLocaleDateString(),
    Hora: t.hora,
    Estado: t.estado,
    Especialidad: t.especialidad || '',
    Especialista: especialistasMap.get(t.especialista_auth_id) || 'Desconocido'
  }));

  const encabezado = [[`Paciente: ${nombreCompletoPaciente}`], []];
  const wb = XLSX.utils.book_new();
  const hoja = XLSX.utils.aoa_to_sheet(encabezado);

  XLSX.utils.sheet_add_json(hoja, filas, { origin: 'A3' });
  XLSX.utils.book_append_sheet(wb, hoja, 'Turnos');

  const blob = new Blob(
    [XLSX.write(wb, { bookType: 'xlsx', type: 'array' })],
    { type: 'application/octet-stream' }
  );

  const nombreArchivo = `turnos_${paciente.name}_${paciente.apellido}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  saveAs(blob, nombreArchivo);
}

}
