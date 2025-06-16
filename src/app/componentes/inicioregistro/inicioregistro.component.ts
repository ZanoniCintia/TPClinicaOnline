import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  standalone:false,
  selector: 'app-inicioresgistro',
  
  templateUrl: './inicioregistro.component.html',
  styleUrl: './inicioregistro.component.scss'
})
export class InicioregistroComponent {
  constructor(private router: Router) {}

  irARegistroPaciente() {
    this.router.navigate(['/registro']);
  }

  irARegistroEspecialista() {
    this.router.navigate(['/registro-especialista']);
    
  }

  volverAlHome() {
  this.router.navigate(['/home']);
}
}
