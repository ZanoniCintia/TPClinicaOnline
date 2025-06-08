import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { environment } from "../../../environments/environment";

// importaciones iguales...
@Component({
  standalone: false,
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  private supabase: SupabaseClient = createClient(environment.apiUrl, environment.publicAnonKey);

  // Datos de formulario
  email = '';
  password = '';
  nombre = '';
  apellido = '';
  edad: number | null = null;
  dni = '';
  obraSocial = '';
  avatarFile: File[] = [];

  // Roles y especialidades
  rolPaciente = false;
  rolEspecialista = false;
  especialidades = ['Cardiología', 'Dermatología', 'Pediatría'];
  especialidadesSeleccionadas: string[] = [];
  nuevaEspecialidad = '';

  mensaje = '';
  error = '';

  constructor(private router: Router) {}

  toggleEspecialidad(esp: string, event: any) {
    if (event.target.checked) {
      this.especialidadesSeleccionadas.push(esp);
    } else {
      this.especialidadesSeleccionadas = this.especialidadesSeleccionadas.filter(e => e !== esp);
    }
  }

  agregarEspecialidad() {
    if (this.nuevaEspecialidad && !this.especialidades.includes(this.nuevaEspecialidad)) {
      this.especialidades.push(this.nuevaEspecialidad);
      this.nuevaEspecialidad = '';
    }
  }

  seleccionarArchivo(event: any) {
    this.avatarFile = Array.from(event.target.files);
  }

  async registrarse() {
    this.error = '';
    this.mensaje = '';

    if (!this.email || !this.password || !this.nombre || !this.apellido || this.edad == null || !this.dni) {
      this.error = 'Todos los campos obligatorios deben estar completos';
      return;
    }

    if (!this.rolPaciente && !this.rolEspecialista) {
      this.error = 'Debés seleccionar al menos un rol';
      return;
    }

    const rol = this.rolPaciente
      ? this.rolEspecialista
        ? 'paciente-especialista'
        : 'paciente'
      : 'especialista';

    // 1. Crear cuenta en Supabase Auth
    const { data: signupData, error: signupError } = await this.supabase.auth.signUp({
      email: this.email,
      password: this.password,
      options: {
        data: { nombre: this.nombre, apellido: this.apellido, rol }
      }
    });

    if (signupError || !signupData.user?.id) {
      this.error = signupError?.message || 'No se pudo registrar el usuario.';
      return;
    }

    // 2. Subir imágenes luego de tener el user ID
    let avatarUrls: string[] = [];
    for (let file of this.avatarFile) {
      const fileName = `${signupData.user.id}_${file.name}`;

      const { error: uploadError } = await this.supabase.storage.from('avatars').upload(fileName, file);

      if (uploadError) {
        this.error = 'Error al subir una imagen.';
        return;
      }

      const { data } = this.supabase.storage.from('avatars').getPublicUrl(fileName);
      avatarUrls.push(data.publicUrl);
    }

    // 3. Guardar datos del usuario en la tabla personalizada
const { error: dbError } = await this.supabase.from('usuarios').insert({
  authid: signupData.user.id,
  email: this.email,
  name: this.nombre,
  apellido: this.apellido,
  age: this.edad,
  dni: this.dni,
  rol: rol,
  obra_social: this.rolPaciente ? this.obraSocial : null,
  especialidades: this.rolEspecialista ? this.especialidadesSeleccionadas.join(', ') : null,
  avatarurl: avatarUrls[0],
  imagenes_perfil: avatarUrls
});



    if (dbError) {
      console.error('Supabase insert error:', dbError); 
      this.error = 'Error al guardar el usuario en la base de datos';
      return;
    }

    this.mensaje = 'Registro exitoso. Verificá tu correo para continuar.';
    this.router.navigate(['/login']);
  }
}
