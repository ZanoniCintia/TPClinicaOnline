import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
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
