import { AuthService } from './../authentication/auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { User } from './user.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const BACKEND_USERS_URL = `${environment.apiUrl}/users`;

@Injectable({ providedIn: 'root' })
export class UserService {
  private users: User[] = [];
  private user!: User;
  private usersUpdated = new Subject<{ users: User[]; usersCount: number }>();
  private userUpdated = new Subject<User>();

  private errorListener = new Subject<{ message: string }>();
  private isLoadingListener = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  getUsers(page: number, limit: number) {
    const queryParameters = `?page=${page}&limit=${limit}`;
    this.http
      .get<{ status: string; result: number; data: {users: User[]} }>(
        `${BACKEND_USERS_URL}${queryParameters}`
      )
      .pipe(
        map((usersData) => {
          return {
            users: usersData.data['users'].map((user) => {
              return {
                preferredName: user.preferredName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                socialMediaHandles: user.socialMediaHandles,
                role: user.role,
                services: user.services,
                subscription: user.subscription,
                active: user.active,
                _id: user._id
              };
            }),
            totalUsers: usersData.result,
          };
        })
      )
      .subscribe(
        (transformedUsersData) => {
          this.users = transformedUsersData.users;
          this.usersUpdated.next({
            users: [...this.users],
            usersCount: transformedUsersData.totalUsers,
          });
          this.isLoadingListener.next(false);
          this.errorListener.next({ message: '' });
        },
        (error) => {
          this.isLoadingListener.next(false);
          this.errorListener.next({ message: error.error.message });
        }
      );
  }

  getUsersUpdateListener() {
    return this.usersUpdated.asObservable();
  }

  getUserUpdateListener() {
    return this.userUpdated.asObservable();
  }

  getUser(id: string) {
    this.http
      .get<{ status: string; data: {user: User} }>(`${BACKEND_USERS_URL}/${id}`)
      .subscribe(
        (response) => {
          console.log('USER_RESPONSE: ', response)
          this.user = response.data['user'];
          this.userUpdated.next({ ...this.user });
          this.isLoadingListener.next(false);
          this.errorListener.next({ message: '' });
        },
        (error) => {
          this.isLoadingListener.next(false);
          this.errorListener.next({ message: error.error.message });
        }
      );
  }

  updateMe(user: {}) {
    this.isLoadingListener.next(true);
    this.http
      .patch<{ status: string; data: {user: User} }>(`${BACKEND_USERS_URL}/update-me`, user)
      .subscribe(
        (response) => {
          this.user = response.data['user'];
          this.userUpdated.next({ ...this.user });
          this.isLoadingListener.next(false);
          this.isLoadingListener.next(false);
          this.errorListener.next({ message: '' });
          this.showSweetSuccessToast(
            'Success',
            'Your request has completed successfully.',
            'success'
          );
          this.router.navigate(['/dashboard/my-profile']);
        },
        (error) => {
          this.isLoadingListener.next(false);
          this.errorListener.next({ message: error.error.message });
          this.showSweetSuccessToast(
            'Request Failed!',
            'An error while processing your request. Please again a bit later.',
            'error'
          );
        }
      );
  }

  deleteMe() {
    this.http
      .delete<{ status: string; message: string }>(`${BACKEND_USERS_URL}/delete-me`)
      .subscribe(
        (response) => {
          this.isLoadingListener.next(false);
          this.errorListener.next({ message: '' });
          this.showSweetSuccessToast('Deleted!', response.message, 'success');
          this.authService.logout();
        },
        (error) => {
          this.isLoadingListener.next(false);
          this.errorListener.next({ message: error.error.message });
          this.showSweetSuccessToast(
            'Delete Failed!',
            'An error occurred while trying to delete your account.',
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

  showSweetSuccessToast(tittle: string, message: string, response: SweetAlertIcon) {
    Swal.fire(tittle, message, response);
  }
}
