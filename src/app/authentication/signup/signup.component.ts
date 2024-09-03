import { Signup } from './signup.model';
import { AuthService } from './../auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    MatChipsModule,
    MatInputModule,
    MatButtonModule,
    RouterModule
  ],
})
export class SignupComponent implements OnInit, OnDestroy {
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  socialProfiles: string[] = [];

  errorMsg!: string;
  private errorSubscription!: Subscription;

  isLoading: boolean = false;
  private isLoadingSubscription!: Subscription;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.isLoadingSubscription = this.authService
      .getIsLoadingListener()
      .subscribe((isLoading) => {
        this.isLoading = isLoading;
      });

    this.errorSubscription = this.authService
      .getErrorListener()
      .subscribe((errorMsg) => {
        this.errorMsg = errorMsg.message;
      });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.socialProfiles.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(profile: string): void {
    const index = this.socialProfiles.indexOf(profile);

    if (index >= 0) {
      this.socialProfiles.splice(index, 1);
    }
  }

  onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    const user: Signup = {
      preferredName: form.value.preferredName,
      address: form.value.address,
      socialMediaHandles: this.socialProfiles,
      email: form.value.email,
      phone: form.value.phone,
      password: form.value.password,
      passwordConfirm: form.value.passwordConfirm,
    };

    this.authService.signup(user);
    form.resetForm();
  }

  ngOnDestroy(): void {
    this.isLoadingSubscription.unsubscribe();
    this.errorSubscription.unsubscribe();
  }
}
