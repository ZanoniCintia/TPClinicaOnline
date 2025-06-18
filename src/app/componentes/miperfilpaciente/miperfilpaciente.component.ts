import { Component, OnInit } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

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
}
