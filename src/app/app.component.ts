import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from './authentication/auth.service';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header/header.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatProgressSpinnerModule, HeaderComponent],
})
export class AppComponent implements OnInit {
  isLoading = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.autoAuthUser();
  }

  onLogoutLoader(isLoading: boolean) {
    this.isLoading = isLoading;
  }
}
