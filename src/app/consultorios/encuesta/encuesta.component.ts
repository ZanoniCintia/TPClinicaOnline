import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  standalone:false,
  selector: 'app-encuesta',
  templateUrl: './encuesta.component.html',
  styleUrls: ['./encuesta.component.scss']
})
export class EncuestaComponent implements OnInit {
  encuestaForm!: FormGroup;
  supabase: SupabaseClient;
  userEmail: string = '';
  mensajeExito: string = '';


  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  }

  async ngOnInit(): Promise<void> {
    const { data: { session } } = await this.supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.userEmail = user.email || '';

    this.encuestaForm = this.fb.group({
      nombre: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(99)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{1,10}$/)]],
      juegoFavorito: ['', Validators.required],
      aspectoVisual: [false],
      jugabilidad: [false],
      rapidez: [false],
      recomienda: ['', Validators.required],
      comentario: ['']
    });
  }

  async enviar(): Promise<void> {
     console.log('📤 Formulario enviado');
    if (this.encuestaForm.invalid) {
      this.encuestaForm.markAllAsTouched();
      return;
    }

    const formData = {
      email: this.userEmail,
      nombre: this.encuestaForm.value.nombre,
      edad: this.encuestaForm.value.edad,
      telefono: this.encuestaForm.value.telefono,
      juegofavorito: this.encuestaForm.value.juegoFavorito,
      aspecto_visual: this.encuestaForm.value.aspectoVisual,
      jugabilidad: this.encuestaForm.value.jugabilidad,
      rapidez: this.encuestaForm.value.rapidez,
      recomendacion: this.encuestaForm.value.recomienda,
      comentario: this.encuestaForm.value.comentario,
      fecha: new Date().toISOString()
    };

    const { error } = await this.supabase.from('encuestas').insert(formData);
if (error) {
    console.error('❌ Error al enviar encuesta:', error.message);
    this.mensajeExito = '❌ Ocurrió un error al guardar la encuesta.';
  } else {
    this.mensajeExito = '✅ ¡Gracias por completar la encuesta!';
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 2000); 
  }
  }
}
