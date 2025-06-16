import { Component, OnInit, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { environment } from "../../../environments/environment";

declare global {
  interface Window {
    onCaptchaSuccess: (token: string | null) => void;
  }
}

@Component({
  standalone: false,
  selector: 'app-registro-especialista',
  templateUrl: './registro-especialista.component.html',
  styleUrls: ['./registro-especialista.component.scss']
})
export class RegistroEspecialistaComponent implements OnInit {
  private supabase: SupabaseClient = createClient(environment.apiUrl, environment.publicAnonKey);
  captchaToken: string | null = null;
  
  email = '';
  password = '';
  nombre = '';
  apellido = '';
  edad: number | null = null;
  dni = '';
  avatarFile: File | null = null;
  especialidades: string[] = [];
  especialidadesSeleccionadas: string[] = [];
  nuevaEspecialidad = '';

  mensaje = '';
  error = '';

  constructor(public router: Router, private ngZone: NgZone) {}

  async ngOnInit() {
    const { data, error } = await this.supabase.from('especialidades').select('nombre');
    if (!error && data) {
      this.especialidades = data.map((e: any) => e.nombre);
    }

    // Captura global del token desde reCAPTCHA v2 
    window.onCaptchaSuccess = (token: string | null) => {
      this.ngZone.run(() => {
        this.captchaToken = token;
      });
    };
  }

  resolverCaptcha(token: string | null) {
    this.captchaToken = token;
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

      this.especialidades.push(especialidad);
      this.especialidadesSeleccionadas.push(especialidad);

      const { error } = await this.supabase.from('especialidades').insert({ nombre: especialidad });
      if (error) {
        console.error('Error al guardar especialidad en Supabase:', error.message);
      }

      this.nuevaEspecialidad = '';
    }
  }

  seleccionarArchivo(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.avatarFile = file;
  }

  async registrarse() {
    this.error = '';
    this.mensaje = '';

    if (!this.email || !this.password || !this.nombre || !this.apellido || this.edad == null || !this.dni) {
      this.error = 'Todos los campos obligatorios deben estar completos';
      return;
    }
    if (!/^[0-9]{8}$/.test(this.dni)) {
      this.error = 'El DNI debe tener exactamente 8 dígitos numéricos';
      return;
    }
    if (this.edad < 21) {
      this.error = 'Los especialistas deben tener al menos 21 años';
      return;
    }
    if (!this.avatarFile) {
      this.error = 'Debe subir una imagen de perfil';
      return;
    }
    if (!this.captchaToken) {
      this.error = 'Por favor, completá el captcha.';
      return;
    }

    const { data: signupData, error: signupError } = await this.supabase.auth.signUp({
      email: this.email,
      password: this.password,
      options: {
        emailRedirectTo: 'http://localhost:4200/login',
        data: { nombre: this.nombre, apellido: this.apellido, rol: 'especialista' }
      }
    });

    if (signupError || !signupData.user?.id) {
      this.error = signupError?.message || 'No se pudo registrar el usuario';
      return;
    }

    const sanitizedName = this.avatarFile.name.replace(/\s+/g, '_').toLowerCase();
    const fileName = `${signupData.user.id}_${sanitizedName}`;

    const { error: uploadError } = await this.supabase.storage.from('avatars').upload(fileName, this.avatarFile, {
      upsert: false,
      cacheControl: '3600'
    });

    if (uploadError) {
      this.error = `Error al subir la imagen: ${uploadError.message}`;
      return;
    }

    const { data: urlData } = this.supabase.storage.from('avatars').getPublicUrl(fileName);
    const avatarUrl = urlData?.publicUrl;

    const { error: dbError } = await this.supabase.from('usuarios').insert({
      authid: signupData.user.id,
      email: this.email,
      name: this.nombre,
      apellido: this.apellido,
      age: this.edad,
      dni: this.dni,
      rol: 'especialista',
      obra_social: null,
      especialidades: this.especialidadesSeleccionadas,
      avatarurl: avatarUrl,
      imagenes_perfil: [avatarUrl],
      estado: false
    });

    if (dbError) {
      this.error = 'Error al guardar el usuario en la base de datos';
      return;
    }

    for (const nombreEsp of this.especialidadesSeleccionadas) {
      const { data: esp } = await this.supabase
        .from('especialidades')
        .select('id')
        .eq('nombre', nombreEsp)
        .single();

      if (esp?.id) {
        await this.supabase
          .from('especialista_especialidad')
          .insert({
            authid: signupData.user.id,
            especialidad_id: esp.id
          });
      }
    }

    this.mensaje = '✅ Registro exitoso. Revisá tu correo para confirmar la cuenta.';
    this.router.navigate(['/login']);
  }
}
