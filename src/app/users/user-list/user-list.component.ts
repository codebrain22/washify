import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { UserViewComponent } from '../user-view/user-view.component';
import { User } from '../user.model';
import { UserService } from '../user.service';
import { AuthService } from '../../authentication/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ServiceStatsComponent } from '../../service-requests/service-stats/service-stats.component';
import { UserStatsComponent } from '../user-stats/user-stats.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    UserStatsComponent
  ],
})
export class UserListComponent implements OnInit, OnDestroy {
  userIsAuthenticated: boolean = false;
  private authListenerSubs!: Subscription;

  users: User[] = [];
  dataSource!: MatTableDataSource<User>;
  displayedColumns: string[] = [
    'username',
    'email',
    'phone',
    'role',
    'servicesRequested',
    'viewMore',
  ];
  private userSubscription!: Subscription;
  //DOM Rendering
  numUsers!: number;
  //For pagination
  totalUsers: number = 0;
  limit: number = 5;
  page: number = 1;
  pageSizeOptions: number[] = [3, 5, 10, 25, 50];
  searchKey: string = '';

  @ViewChild(MatSort)
  sort!: MatSort;

  errorMsg!: string;
  private errorSubscription!: Subscription;

  isLoading: boolean = false;
  private isLoadingSubscription!: Subscription;

  constructor(
    public dialog: MatDialog,
    private userService: UserService,
    private _liveAnnouncer: LiveAnnouncer,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userService.getUsers(this.page, this.limit);
    this.isLoading = true;
    this.userSubscription = this.userService
      .getUsersUpdateListener()
      .subscribe((userData: { users: User[]; usersCount: number }) => {
        this.users = userData.users;
        this.totalUsers = userData.usersCount;
        this.numUsers = userData.usersCount;
        this.dataSource = new MatTableDataSource<User>(this.users);
        setTimeout(() => {
          this.dataSource.sort = this.sort;
        });
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

    this.userIsAuthenticated = this.authService.getIsAuthenticated();
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
      });
  }

  onViewUserDialog(user: User): void {
    const dialogRef = this.dialog.open(UserViewComponent, {
      panelClass: 'dialog-responsive',
      autoFocus: false,
      data: user,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.userService.sendMessage(result.service.id, result.message);
      }
    });
  }

  onPageChanged(pageData: PageEvent) {
    this.page = pageData.pageIndex + 1;
    this.limit = pageData.pageSize;
    this.userService.getUsers(this.page, this.limit);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  applyFilter() {
    this.dataSource.filter = this.searchKey.trim().toLowerCase();
  }

  onSearchClear() {
    this.searchKey = '';
    this.applyFilter();
  }

  // shortenEmail(email: string) {
  //   return email.length > 12 ? `${email.substring(0, 12)}...` : email;
  // }

  ngOnDestroy(): void {
    this.authListenerSubs.unsubscribe();
    this.userSubscription.unsubscribe();
    this.isLoadingSubscription.unsubscribe();
    this.errorSubscription.unsubscribe();
  }
}
