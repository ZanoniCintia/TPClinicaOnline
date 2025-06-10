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

  if (files.length !== 2) {
    this.error = 'Debes subir exactamente 2 imágenes';
    this.avatarFile = [];
    return;
  }

  this.avatarFile = files;
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

   //aca valido mail
   const { data: signupData, error: signupError } = await this.supabase.auth.signUp({
  email: this.email,
  password: this.password,
  options: {
   /* emailRedirectTo: 'https://tpclinica.web.app/login',*/ //deploy
    emailRedirectTo: 'http://localhost:4200/login', //local
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



    

    // 2. Subir imágenes luego de tener el user ID
    let avatarUrls: string[] = [];
    for (let file of this.avatarFile) {
  const sanitizedName = file.name.replace(/\s+/g, '_').toLowerCase();
  const fileName = `${signupData.user.id}_${sanitizedName}`;

  const { error: uploadError } = await this.supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      upsert: false, // evita sobrescribir sin querer
      cacheControl: '3600'
    });

  if (uploadError) {
    console.error('Upload error:', uploadError.message);
    this.error = `Error al subir la imagen "${file.name}": ${uploadError.message}`;
    return;
  }

  const { data: urlData } = this.supabase.storage.from('avatars').getPublicUrl(fileName);
  if (urlData?.publicUrl) {
    avatarUrls.push(urlData.publicUrl);
  } else {
    this.error = `No se pudo obtener URL pública de la imagen ${file.name}`;
    return;
  }
}


    // 3. Guardar datos del usuario 
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
      imagenes_perfil: avatarUrls,
      estado: this.rolEspecialista ? false : true 
    });

    if (dbError) {
      console.error('Supabase insert error:', dbError); 
      this.error = 'Error al guardar el usuario en la base de datos';
      return;
    }

    this.mensaje = '✅ Registro exitoso. Debes verificar tu email antes de poder ingresar.';
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 4000); // espera 4 segundos antes de redirigir

  }
}
