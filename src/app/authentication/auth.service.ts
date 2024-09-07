import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Login } from './login/login.model';
import { HttpClient } from '@angular/common/http';
import { Signup } from './signup/signup.model';
import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { User } from '../users/user.model';
import { SocialUser, SocialAuthService } from '@abacritt/angularx-social-login';

const BACKEND_USERS_URL = `${environment.apiUrl}/users`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token!: string;
  private tokenTimer: any;
  private authStatusListener = new Subject<boolean>();
  isAdminListener = new Subject<boolean>();
  isAuthenticated: boolean = false;

  private errorListener = new Subject<{ message: string }>();
  private isLoadingListener = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private socialAuthService: SocialAuthService,
    private router: Router
  ) {}

  getToken() {
    return this.token;
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getIsAdminListener() {
    return this.isAdminListener.asObservable();
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  signup(user: Signup) {
    this.http
      .post<{
        status: string;
        token: string;
        expiresIn: number;
        data: { user: User };
      }>(`${BACKEND_USERS_URL}/signup`, user)
      .subscribe(
        (response) => {
          const token = response.token;
          this.token = token;
          if (token) {
            const user = response.data.user;
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration / 1000);
            this.isAuthenticated = true;
            const isAdmin = user.role === 'admin' ? true : false;
            this.isAdminListener.next(isAdmin);
            this.authStatusListener.next(true);
            const now = new Date();
            const expirationDate = new Date(now.getTime() + expiresInDuration);
            this.SaveAuthData(user._id ?? '', user.role, token, expirationDate);
            this.isLoadingListener.next(false);
            this.errorListener.next({ message: '' });
            this.showSweetAlertToast(
              'Account Created Successfully',
              'You may now sign in with your new credentials.',
              'success'
            );
            this.router.navigate(['/dashboard/subscribe']);
          }
          // this.token = response.token;
          this.isLoadingListener.next(false);
          this.errorListener.next({ message: '' });
          this.showSweetAlertToast(
            'Account Created Successfully',
            'You may now sign in with your new credentials.',
            'success'
          );
          this.router.navigate(['/dashboard/subscribe']);
        },
        (error) => {
          this.authStatusListener.next(false);
          this.isLoadingListener.next(false);
          this.errorListener.next({ message: error.error.message });
        }
      );
  }

  login(user: Login) {
    this.http
      .post<{
        status: string;
        token: string;
        expiresIn: number;
        data: { user: User };
      }>(`${BACKEND_USERS_URL}/login`, user)
      .subscribe(
        (response) => {
          const token = response.token;
          this.token = token;
          if (token) {
            const user = response.data['user'];
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration / 1000);
            this.isAuthenticated = true;
            const isAdmin = user.role === 'admin' ? true : false;
            this.isAdminListener.next(isAdmin);
            this.authStatusListener.next(true);
            const now = new Date();
            const expirationDate = new Date(now.getTime() + expiresInDuration);
            this.SaveAuthData(user._id ?? '', user.role, token, expirationDate);
            this.isLoadingListener.next(false);
            this.errorListener.next({ message: '' });
            if (isAdmin) {
              this.router.navigate(['/dashboard/all-orders']);
            } else {
              this.router.navigate(['/dashboard/my-orders']);
            }
          }
        },
        (error) => {
          this.authStatusListener.next(false);
          this.isLoadingListener.next(false);
          this.errorListener.next({ message: error.error.message });
        }
      );
  }

  socialLogin(user: SocialUser) {
    this.http
      .post<{
        status: string;
        token: string;
        expiresIn: number;
        data: { user: User };
      }>(`${BACKEND_USERS_URL}/social-login`, user)
      .subscribe(
        (response) => {
          const token = response.token;
          console.log('response: ', response);
          this.token = token;
          if (token) {
            const user = response.data['user'];
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration / 1000);
            this.isAuthenticated = true;
            const isAdmin = user.role === 'admin' ? true : false;
            this.isAdminListener.next(isAdmin);
            this.authStatusListener.next(true);
            const now = new Date();
            const expirationDate = new Date(now.getTime() + expiresInDuration);
            this.SaveAuthData(user._id ?? '', user.role, token, expirationDate);
            this.isLoadingListener.next(false);
            this.errorListener.next({ message: '' });
            if (isAdmin) {
              this.router.navigate(['/dashboard/all-orders']);
            } else {
              this.router.navigate(['/dashboard/my-orders']);
            }
          }
        },
        (error) => {
          this.authStatusListener.next(false);
          this.isLoadingListener.next(false);
          this.errorListener.next({ message: error.error.message });
        }
      );
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token ?? '';
      this.isAuthenticated = true;
      const isAdmin = authInformation.role === 'admin' ? true : false;
      this.isAdminListener.next(isAdmin);
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
      this.isLoadingListener.next(false);
      this.errorListener.next({ message: '' });
      if (isAdmin) {
        this.router.navigate(['/dashboard/all-orders']);
      } else {
        this.router.navigate(['/dashboard/my-orders']);
      }
    }
  }

  logout() {
    this.token = '';
    this.isAuthenticated = false;
    this.socialAuthService.signOut();
    clearTimeout(this.tokenTimer);
    this.authStatusListener.next(false);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  private SaveAuthData(
    id: string,
    role: string,
    token: string,
    expirationDate: Date
  ) {
    localStorage.setItem('id', id);
    localStorage.setItem('role', role);
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem('id');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const expirationDate = localStorage.getItem('expiration') as string;
    if (!token && !expirationDate) {
      return undefined;
    }

    return {
      token: token,
      role: role,
      expirationDate: new Date(expirationDate),
    };
  }

  getUserId() {
    const id = localStorage.getItem('id');
    return id;
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
