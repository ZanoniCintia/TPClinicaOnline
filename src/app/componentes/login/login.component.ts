import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLink ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMsg: string = '';

  constructor(private router: Router) {}

  async login() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: this.email,
      password: this.password,
    });

    if (error) {
      this.errorMsg = error.message.includes('invalid login')
        ? 'Usuario o contraseña incorrectos'
        : error.message;
    } else {
      // Guardar log de ingreso (en Supabase o local)
      await supabase
        .from('logs')
        .insert({ usuario: this.email, fecha: new Date().toISOString() });
        await supabase.from('logs').insert({
          email: 'test@example.com',
          fecha: new Date().toISOString(),
        })

      this.router.navigate(['/home']);
      

    }
  }

  

  completarTest(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}
