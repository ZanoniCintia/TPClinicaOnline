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

}
