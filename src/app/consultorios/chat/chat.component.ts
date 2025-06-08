import { Component, OnInit, OnDestroy } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  standalone:false,
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  mensajes: any[] = [];
  nuevoMensaje: string = '';
  userEmail: string = '';
  supabase: SupabaseClient;
  subscription: any;

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

    this.userEmail = user.email!;

   
    const { data, error } = await this.supabase
      .from('chat')
      .select('*')
      .order('fecha_chat', { ascending: true });

    if (!error) {
      this.mensajes = data;
    }

    // realtime
    this.subscription = this.supabase
      .channel('chat-room')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat'
        },
        (payload) => {
          this.mensajes.push(payload.new);
        }
      )
      .subscribe();
  }

  async enviarMensaje() {
    if (this.nuevoMensaje.trim()) {
      const { error } = await this.supabase.from('chat').insert({
        user_email: this.userEmail,
        mensaje: this.nuevoMensaje
      });

      if (!error) {
        this.nuevoMensaje = '';
      }
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.supabase.removeChannel(this.subscription);
    }
  }

  volverHome() {
    this.router.navigate(['/home']);
  }
  
}
