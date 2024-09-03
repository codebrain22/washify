import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

const BACKEND_USERS_URL = `${environment.apiUrl}/users`;

@Injectable({ providedIn: 'root' })
export class PasswordResetService {
  private errorListener = new Subject<{ message: string }>();
  private isLoadingListener = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  forgotPassword(email: string) {
    const userEmail = { email: email };
    this.http
      .post<{ status: string; token: string; data: {} }>(
        `${BACKEND_USERS_URL}/forgot-password`,
        userEmail
      )
      .subscribe(
        (response) => {
          this.isLoadingListener.next(false);
          this.errorListener.next({ message: '' });
          this.showSweetAlertToast(
            'Email Sent',
            'We have sent you an email with a password reset link. Please check your email inbox or spam folder.',
            'success'
          );
        },
        (error) => {
          this.isLoadingListener.next(false);
          this.errorListener.next({ message: error.error.message });
          this.showSweetAlertToast(
            'Email Failed',
            'An error occurred while sending an email.',
            'error'
          );
        }
      );
  }

  resetPassword(
    newPassword: string,
    newPasswordConfirm: string,
    passwordResetToken: string
  ) {
    const token = passwordResetToken;
    const userPasswords = {
      password: newPassword,
      passwordConfirm: newPasswordConfirm,
    };
    this.http
      .patch<{ status: string; token: string; data: {} }>(
        `${BACKEND_USERS_URL}/reset-password/${token}`,
        userPasswords
      )
      .subscribe(
        (response) => {
          this.isLoadingListener.next(false);
          this.errorListener.next({ message: '' });
          this.showSweetAlertToast(
            'Password Reset Successful',
            'You have successfully reset your password. Please login again with a new password.',
            'success'
          );
          this.router.navigate(['/signin']);
        },
        (error) => {
          this.isLoadingListener.next(false);
          this.errorListener.next({ message: error.error.message });
          this.showSweetAlertToast(
            'Password Reset Failed',
            'An error occurred while resetting your password.',
            'error'
          );
        }
      );
  }

  updatePassword(
    currentPassword: string,
    newPassword: string,
    passwordConfirm: string
  ) {
    const userPasswords = {
      passwordCurrent: currentPassword,
      password: newPassword,
      passwordConfirm: passwordConfirm,
    };

    this.http
      .patch<{ status: string; token: string; data: {} }>(
        `${BACKEND_USERS_URL}/update-my-password`,
        userPasswords
      )
      .subscribe(
        (response) => {
          this.isLoadingListener.next(false);
          this.errorListener.next({ message: '' });
          this.showSweetAlertToast(
            'Password Updated Successful',
            'Your password was successfully updated. We need to reauthenticate you. Please login again with your new password.',
            'success'
          );
          this.authService.logout();
        },
        (error) => {
          this.isLoadingListener.next(false);
          this.errorListener.next({ message: error.error.message });
          this.showSweetAlertToast(
            'Password Update Failed',
            'An error occurred while updating your password.',
            'error'
          );
        }
      );
  }

  getErrorListener() {
    return this.errorListener.asObservable();
  }

  getIsLoadingListener() {
    return this.isLoadingListener.asObservable();
  }

  showSweetAlertToast(tittle: string, message: string, status: SweetAlertIcon) {
    Swal.fire(tittle, message, status);
  }
}
