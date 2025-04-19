import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({

  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink ],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  email: string = '';
  password: string = '';
  nombre: string = '';
  edad: number | null = null;
  avatar_url: string = '';

  registrarse() {
    console.log('Usuario registrado:', {
      email: this.email,
      password: this.password,
      nombre: this.nombre,
      edad: this.edad,
      avatar_url: this.avatar_url
    });
  }
}
