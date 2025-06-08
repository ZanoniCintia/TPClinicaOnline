import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Injectable({ providedIn: 'root' })
export class AuthAdminGuard implements CanActivate {
  constructor(private router: Router) {}

  async canActivate(): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      this.router.navigate(['/login']);
      return false;
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('authid', userId)
      .single();

    if (error || data?.rol !== 'admin') {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
