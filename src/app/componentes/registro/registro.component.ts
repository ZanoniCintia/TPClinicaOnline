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
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit {
  private supabase: SupabaseClient = createClient(environment.apiUrl, environment.publicAnonKey);
  captchaToken: string | null = null;
  captchaValido: boolean = false;

  email = '';
  password = '';
  nombre = '';
  apellido = '';
  edad: number | null = null;
  dni = '';
  obraSocial = '';
  avatarFile: File[] = [];

  mensaje = '';
  error = '';

  tipoSeleccionado: 'paciente' = 'paciente'; // Fijo

  constructor(public router: Router, private ngZone: NgZone) {}

  ngOnInit() {
    // Captura global del token desde reCAPTCHA v2
    window.onCaptchaSuccess = (token: string | null) => {
      this.ngZone.run(() => {
        this.captchaToken = token;
        this.captchaValido = !!token;
        console.log("Captcha recibido:", token);
      });
    };
  }

  seleccionarArchivo(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.avatarFile = files;

    const cantidadEsperada = 2;

    if (files.length !== cantidadEsperada) {
      this.error = `Debes subir exactamente ${cantidadEsperada} imágenes.`;
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

    if (!this.avatarFile.length || this.avatarFile.length !== 2) {
      this.error = 'Debes subir exactamente 2 imágenes.';
      return;
    }

    if (!this.captchaToken) {
      this.error = 'Por favor, completá el captcha.';
      return;
    }

    const rol = 'paciente'; // Fijo

    const { data: signupData, error: signupError } = await this.supabase.auth.signUp({
      email: this.email,
      password: this.password,
      options: {
        emailRedirectTo: 'http://localhost:4200/login',
        data: { nombre: this.nombre, apellido: this.apellido, rol }
      }
    });

    if (signupError || !signupData.user?.id) {
      this.error = signupError?.message || 'No se pudo registrar el usuario.';
      return;
    }

    this.mensaje = '✅ Registro exitoso. Revisá tu correo para confirmar la cuenta.';
    this.router.navigate(['/login']);
  }

  volverAlHome() {
    this.router.navigate(['/home']);
  }

  resolverCaptcha(token: string | null) {
    this.captchaToken = token;
    this.captchaValido = !!token;
  }
}
