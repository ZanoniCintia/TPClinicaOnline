import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { ModalInputComponent } from '../modal-input/modal-input.component'; 

@Component({
  standalone:false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  supabase: SupabaseClient;
  userName = '';
  userEmail = '';
  avatarUrl = '';
  misTurnos: any[] = [];

  modalVisible = false;
  modalTitulo = '';
  modalDescripcion = '';
  modalTurno: any = null;
  onConfirmarModal: (motivo: string) => void = () => {};


  constructor(private router: Router) {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  }

  async ngOnInit() {
    const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
    const user = session?.user;

    if (!user || sessionError) {
      this.router.navigate(['/login']);
      return;
    }

    this.userEmail = user.email ?? '';

    const { data: usuario } = await this.supabase
      .from('usuarios')
      .select('name, avatarurl')
      .eq('email', this.userEmail)
      .single();

    if (usuario) {
      this.userName = usuario.name;
      this.avatarUrl = Array.isArray(usuario.avatarurl)
        ? usuario.avatarurl[0]
        : typeof usuario.avatarurl === 'string'
          ? usuario.avatarurl.replace(/^"(.*)"$/, '$1')
          : '';
    }

    await this.supabase.from('logs').insert({
      name: this.userName,
      email: this.userEmail,
      fecha: new Date().toISOString(),
    });

    await this.cargarTurnos(user.id);
  }

  async cargarTurnos(userId: string) {
    const { data: turnos, error } = await this.supabase
      .from('turnos')
      .select('*')
      .eq('paciente_auth_id', userId)
      .order('fecha', { ascending: true });

    if (error) {
      console.error('Error al cargar turnos:', error.message);
      return;
    }

    this.misTurnos = turnos ?? [];
  }
  

 cancelarTurno(turno: any) {
  
  this.abrirModal(
    'Cancelar turno',
    'Ingrese el motivo de cancelación:',
    turno,
    async (motivo) => {
      const { error } = await this.supabase
        .from('turnos')
        .update({ estado: 'cancelado', comentario_cancelacion: motivo })
        .eq('id', turno.id);

      if (!error) {
        await this.cargarTurnos(turno.paciente_auth_id);
      }
    }
  );
}


  verResena(turno: any) {
    alert(`📝 Reseña: ${turno.resena}`);
  }

  async calificarAtencion(turno: any) {
    const comentario = prompt('✍️ Ingrese su comentario sobre la atención:');
    const calificacion = prompt('⭐ Califique la atención del 1 al 5:');

    if (!comentario || !calificacion) return;

    const califInt = parseInt(calificacion);
    if (isNaN(califInt) || califInt < 1 || califInt > 5) {
      alert('La calificación debe ser un número del 1 al 5.');
      return;
    }

    const { error } = await this.supabase
      .from('turnos')
      .update({
        calificacion: califInt,
        comentario_calificacion: comentario
      })
      .eq('id', turno.id);

    if (error) {
      console.error('Error calificando turno:', error.message);
    } else {
      await this.cargarTurnos(turno.paciente_auth_id);
    }
  }

  async completarEncuesta(turno: any) {
    const respuesta = prompt('📊 ¿Qué te pareció la experiencia general?');
    if (!respuesta) return;

    const { error } = await this.supabase
      .from('turnos')
      .update({
        encuesta: { respuesta },
      })
      .eq('id', turno.id);

    if (error) {
      console.error('Error guardando encuesta:', error.message);
    } else {
      await this.cargarTurnos(turno.paciente_auth_id);
    }
  }

  async logout() {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      console.error('Error cerrando sesión:', error.message);
    } else {
      console.log('Sesión cerrada exitosamente');
      this.router.navigate(['/login']);
    }
  }
  

  mostrarModal = false;

modalCallback: (valor: string) => void = () => {};

abrirModal(titulo: string, descripcion: string, turno: any, callback: (valor: string) => void) {
  this.modalTitulo = titulo;
  this.modalDescripcion = descripcion;
  this.modalTurno = turno;
  this.modalCallback = callback;
  this.mostrarModal = true;
}

onModalAceptar(valor: string) {
  this.mostrarModal = false;
  this.modalCallback(valor);
}

onModalCancelar() {
  this.mostrarModal = false;
}

async confirmarTurno(turno: any) {
  const { error } = await this.supabase
    .from('turnos')
    .update({ estado: 'confirmado' })
    .eq('id', turno.id);

  if (!error) {
    await this.cargarTurnos(turno.paciente_auth_id);
  }
}

async reprogramarTurno(turno: any) {
  // Simple redirección al componente de solicitud con valores prellenados
  this.router.navigate(['/solicitar-turno'], {
    queryParams: {
      especialidad: turno.especialidad,
      especialista: turno.especialista_auth_id
    }
  });
}

abrirCancelar(turno: any) {
  this.abrirModal(
    'Cancelar turno',
    'Ingrese el motivo de cancelación:',
    turno,
    async (motivo: string) => {
      const { error } = await this.supabase
        .from('turnos')
        .update({ estado: 'cancelado', comentario_cancelacion: motivo })
        .eq('id', turno.id);

      if (!error) {
        await this.cargarTurnos(turno.paciente_auth_id);
      }
    }
  );
}


}
