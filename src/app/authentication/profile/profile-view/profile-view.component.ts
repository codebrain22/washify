import { ProfileEditComponent } from './../profile-edit/profile-edit.component';
import { UserService } from './../../../users/user.service';
import { User } from './../../../users/user.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatIconModule
  ],
})
export class ProfileViewComponent implements OnInit, OnDestroy {
  user!: User;
  private userListenerSubs!: Subscription;

  errorMsg!: string;
  private errorSubscription!: Subscription;

  isLoading: boolean = false;
  private isLoadingSubscription!: Subscription;

  notSubscribed: string = 'CURRENTLY NOT SUBSCRIBED TO ANY SERVICE';
  subscribed!: string;

  constructor(
    public dialog: MatDialog,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    const userId = this.authService.getUserId()!;
    this.userService.getUser(userId);
    this.userListenerSubs = this.userService
      .getUserUpdateListener()
      .subscribe((user) => {
        this.user = user;
        this.subscribed = `CURRENTLY SUBSCRIBED TO ${this.user.subscription}`;
      });

    this.isLoadingSubscription = this.userService
      .getIsLoadingListener()
      .subscribe((isLoading) => {
        this.isLoading = isLoading;
      });

    this.errorSubscription = this.userService
      .getErrorListener()
      .subscribe((errorMsg) => {
        this.errorMsg = errorMsg.message;
      });
  }

  onEditProfileDialog(user: User): void {
    this.dialog.open(ProfileEditComponent, {
      panelClass: 'dialog-responsive',
      autoFocus: false,
      data: user,
    });
  }

  onDeleteUserAccount() {
    Swal.fire({
      title: 'By confirming, you agree that this account will be deleted permanently.',
      text: "We recommend that you cancel your services or complete them first before deleting your account.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3F51B5',
      cancelButtonColor: '#F44336',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.userService.deleteMe();
      }
    });
  }

  ngOnDestroy(): void {
    this.userListenerSubs.unsubscribe();
    this.isLoadingSubscription.unsubscribe();
    this.errorSubscription.unsubscribe();
  }
}
