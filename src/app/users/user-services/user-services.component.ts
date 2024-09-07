import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import Swal from 'sweetalert2';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { UserService } from '../user.service';
import { ServiceRequest } from '../../service-requests/service-requests.model';
import { ServiceRequestService } from '../../service-requests/service-request.service';
import { AuthService } from '../../authentication/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserStatsComponent } from '../user-stats/user-stats.component';
import { RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-services',
  templateUrl: './user-services.component.html',
  styleUrls: ['./user-services.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    UserStatsComponent,
  ],
})
export class UserServicesComponent implements OnInit, OnDestroy {
  userIsAuthenticated: boolean = false;
  private authListenerSubs!: Subscription;
  private userListenerSubs!: Subscription;
  userId!: string;
  services: ServiceRequest[] = [];

  dataSource!: MatTableDataSource<ServiceRequest>;
  displayedColumns: string[] = [
    'package',
    'pickupTime',
    'paymentStatus',
    'status',
    'returnedOn',
    'orderAgain',
  ];

  //DOM Rendering
  numServices!: number;
  // Pagination
  totalServices: number = 0;
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
    private _liveAnnouncer: LiveAnnouncer,
    private authService: AuthService,
    private userService: UserService,
    public serviceRequestService: ServiceRequestService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.userId = this.authService.getUserId() ?? '';
    console.log('USER_ID: ', this.userId)

    this.userService.getUser(this.userId);
    this.userListenerSubs = this.userService
      .getUserUpdateListener()
      .subscribe((user) => {
        this.services = JSON.parse(JSON.stringify(user.services));
        this.numServices = this.services.length;
        this.dataSource = new MatTableDataSource<ServiceRequest>(this.services);
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

  onReOrder(userService: ServiceRequest) {
    Swal.fire({
      title: 'Proceed?',
      text: "You won't be able to update this order once it is created!",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3F51B5',
      cancelButtonColor: '#F44336',
      confirmButtonText: 'Yes, create it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        const service: ServiceRequest = {
          _id: '',
          serviceType: userService.serviceType,
          reference: userService.reference,
          pickupTime: userService.pickupTime,
          paymentMethod: userService.paymentMethod,
          paymentStatus: 'Pending',
          status: 'Pending collection',
          requestedOn: new Date(Date.now()).toISOString(),
          returnedOn: '',
          owner: this.userId,
          onceOff: '',
        };
        this.serviceRequestService.addService(service, undefined);
      }
    });
  }

  formatDate(date: Date) {
    return moment(date).format('DD/MM/YYYY');
  }

  onPageChanged(pageData: PageEvent) {
    this.page = pageData.pageIndex + 1;
    this.limit = pageData.pageSize;
    //this.serviceService.getServices(this.page, this.limit);
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

  ngOnDestroy(): void {
    this.userListenerSubs.unsubscribe();
    this.isLoadingSubscription.unsubscribe();
    this.errorSubscription.unsubscribe();
  }
}
