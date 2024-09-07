import { AuthService } from './../../authentication/auth.service';
import { ServiceViewComponent } from './../service-view/service-view.component';
import { ServiceRequestService } from '../service-request.service';
import { ServiceRequest } from '../service-requests.model';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { ServiceEditComponent } from '../service-edit/service-edit.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSort, Sort } from '@angular/material/sort';
import { Service } from 'bonjour';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { ServiceStatsComponent } from '../service-stats/service-stats.component';
import { RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.css'],
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
    ServiceStatsComponent
  ],
})
export class ServiceListComponent implements OnInit, OnDestroy {
  userIsAuthenticated: boolean = false;
  private authListenerSubs!: Subscription;
  services: ServiceRequest[] = [];
  private serviceSubscription!: Subscription;

  dataSource!: MatTableDataSource<ServiceRequest>;
  displayedColumns: string[] = [
    'package',
    'pickupTime',
    'paymentStatus',
    'status',
    'statusUpdate',
    'viewMore',
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
    private serviceService: ServiceRequestService,
    private _liveAnnouncer: LiveAnnouncer,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.serviceService.getServices(this.page, this.limit);
    //Show spinner
    this.isLoading = true;
    this.serviceSubscription = this.serviceService
      .getServicesUpdateListener()
      .subscribe(
        (serviceData: {
          services: ServiceRequest[];
          servicesCount: number;
        }) => {
          this.services = serviceData.services;
          this.totalServices = serviceData.servicesCount;
          this.numServices = serviceData.servicesCount;
          this.dataSource = new MatTableDataSource<ServiceRequest>(
            this.services
          );
          setTimeout(() => {
            this.dataSource.sort = this.sort;
          });
        }
      );
    //Stop spinner
    this.isLoadingSubscription = this.serviceService
      .getIsLoadingListener()
      .subscribe((isLoading) => {
        this.isLoading = isLoading;
      });

    this.errorSubscription = this.serviceService
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

  reportStats() {
    let basic = 0;
    let advanced = 0;
    let premium = 0;

    this.services.forEach((service) => {
      if (service.serviceType.includes('Basic')) {
        basic += 1;
      } else if (service.serviceType.includes('Advanced')) {
        advanced += 1;
      } else {
        premium += 1;
      }
    });

    return {
      basic: basic,
      advanced: advanced,
      premium: premium,
    };
  }

  formatDate(date: Date) {
    return moment(date).format('DD/MM/YYYY');
  }

  onUpdateStatusDialog(serviceId: string): void {
    console.log('SERV ID: ', serviceId)
    const dialogRef = this.dialog.open(ServiceEditComponent, {
      panelClass: 'dialog-responsive',
      data: serviceId,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading = true;
        this.serviceService.updateStatus(result.id, result.status);
      }
    });
  }

  onViewServiceDialog(service: Service): void {
    const dialogRef = this.dialog.open(ServiceViewComponent, {
      panelClass: 'dialog-responsive',
      data: service,
    });

    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result) {
    //     // this.serviceService.sendMessage(result.service.id, result.message);
    //   }
    // });
  }

  onPageChanged(pageData: PageEvent) {
    this.page = pageData.pageIndex + 1;
    this.limit = pageData.pageSize;
    this.serviceService.getServices(this.page, this.limit);
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
    this.authListenerSubs.unsubscribe();
    this.serviceSubscription.unsubscribe();
    this.isLoadingSubscription.unsubscribe();
    this.errorSubscription.unsubscribe();
  }
}
