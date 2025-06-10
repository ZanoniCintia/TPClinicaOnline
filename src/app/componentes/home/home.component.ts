import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
@Component({
  standalone:false,
  
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  supabase: SupabaseClient;
  userName: string = '';
  userEmail: string = '';
  avatarUrl: string = '';

  constructor(private router: Router) {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  }

  async ngOnInit() {
    const { data: { session } } = await this.supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.userEmail = user.email || '';

    // Buscar datos en la tabla usuarios
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('name, avatarurl')
      .eq('email', this.userEmail)
      .single();
    


    if (data) {
      this.userName = data.name;
      this.avatarUrl = Array.isArray(data.avatarurl)
  ? data.avatarurl[0]
  : (typeof data.avatarurl === 'string' ? data.avatarurl.replace(/^"(.*)"$/, '$1') : '');


    }
    console.log('Usuario obtenido:', data);
    // Guardar en tabla logs
    await this.supabase.from('logs').insert({
      name: this.userName,
      email: this.userEmail,
      fecha: new Date().toISOString(),
    });
  }

  irAJuego(ruta: string) {
    this.router.navigate([`/juegos/${ruta}`]);
  }


  async logout() {
    const { error } = await this.supabase.auth.signOut();
  
    if (error) {
      console.error('Error cerrando sesión:', error.message);
    } else {
      console.log('Sesión cerrada exitosamente');
      this.router.navigate(['/login']); // Redirige al login
    }
  }
}
