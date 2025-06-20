import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { slideInAnimation } from './route-animations';

@Component({
  selector: 'app-root',
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [slideInAnimation]
})
export class AppComponent {
  title = 'SalaJuegosZanoni';

  constructor(private router: Router) {

  }

  goTo(path: string) {
    this.router.navigate([path]);
    // this.router.navigateByUrl(path)
  }
}
