import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { environment } from "../../../environments/environment";

@Component({
  standalone: false,
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit {
  private supabase: SupabaseClient = createClient(environment.apiUrl, environment.publicAnonKey);
  
  email = '';
  password = '';
  nombre = '';
  apellido = '';
  edad: number | null = null;
  dni = '';
  obraSocial = '';
  avatarFile: File[] = [];
  especialidades: string[] = [];

  rolPaciente = false;
  rolEspecialista = false;

  especialidadesSeleccionadas: string[] = [];
  nuevaEspecialidad = '';

  mensaje = '';
  error = '';

  constructor(private router: Router) {}

  async ngOnInit() {
    const { data, error } = await this.supabase.from('especialidades').select('nombre');
    if (!error && data) {
      this.especialidades = data.map((e: any) => e.nombre);
    }
  }

  toggleEspecialidad(esp: string, event: any) {
    if (event.target.checked) {
      this.especialidadesSeleccionadas.push(esp);
    } else {
      this.especialidadesSeleccionadas = this.especialidadesSeleccionadas.filter(e => e !== esp);
    }
  }

  async agregarEspecialidad() {
    if (this.nuevaEspecialidad && !this.especialidades.includes(this.nuevaEspecialidad)) {
      const especialidad = this.nuevaEspecialidad.trim();

      // Agregar al array local
      this.especialidades.push(especialidad);
      this.especialidadesSeleccionadas.push(especialidad);

      // Guardar en Supabase
      const { error } = await this.supabase.from('especialidades').insert({ nombre: especialidad });
      if (error) {
        console.error('Error al guardar especialidad en Supabase:', error.message);
      }

      this.nuevaEspecialidad = '';
    }
  }

 /* seleccionarArchivo(event: any) {
    this.avatarFile = Array.from(event.target.files);
  }*/

seleccionarArchivo(event: any) {
  const files = Array.from(event.target.files) as File[];
  this.avatarFile = files;

  const esPaciente = this.rolPaciente;
  const esEspecialista = this.rolEspecialista;

  const cantidadMinima = (esPaciente && !esEspecialista) ? 2 : 1;

  if (files.length < cantidadMinima) {
    this.error = `Debes subir al menos ${cantidadMinima} imagen${cantidadMinima > 1 ? 'es' : ''} según tu rol.`;
    this.avatarFile = [];
    return;
  }

  this.error = ''; 
}



 async registrarse() {
  this.error = '';
  this.mensaje = '';

  if (!this.email || !this.password || !this.nombre || !this.apellido || this.edad == null || !this.dni) {
    this.error = 'Todos los campos obligatorios deben estar completos';
    return;
  }
  if (!/^\d{8}$/.test(this.dni)) {
    this.error = 'El DNI debe tener exactamente 8 dígitos numéricos';
    return;
  }
  if (!this.rolPaciente && !this.rolEspecialista) {
    this.error = 'Debés seleccionar al menos un rol';
    return;
  }
  if (this.rolEspecialista && this.edad < 21) {
    this.error = 'Los especialistas deben tener al menos 21 años';
    return;
  }

  let rol = '';
  if (this.rolPaciente && this.rolEspecialista) {
    rol = 'especialista'; 
  } else if (this.rolPaciente) {
    rol = 'paciente';
  } else if (this.rolEspecialista) {
    rol = 'especialista';
  }

  const { data: signupData, error: signupError } = await this.supabase.auth.signUp({
    email: this.email,
    password: this.password,
    options: {
      emailRedirectTo: 'http://localhost:4200/login',
      data: { nombre: this.nombre, apellido: this.apellido, rol }
    }
  });

  if (signupError || !signupData.user?.id) {
    if (signupError?.message?.includes('you can only request this after')) {
      this.error = 'Por seguridad, debes esperar unos segundos antes de intentarlo nuevamente.';
    } else {
      this.error = signupError?.message || 'No se pudo registrar el usuario.';
    }
    return;
  }

  this.mensaje = '✅ Registro exitoso. Revisá tu correo para confirmar la cuenta.';
  this.router.navigate(['/login']);
}

}
