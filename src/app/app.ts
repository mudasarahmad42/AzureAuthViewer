import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MsalRedirectHandlerComponent } from './core/components/msal-redirect-handler/msal-redirect-handler.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MsalRedirectHandlerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
