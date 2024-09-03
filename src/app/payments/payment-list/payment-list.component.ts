import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { PaymentDetails } from '../paymentDetails.model';
import { PaymentDetailsService } from '../paymentDetails.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTableModule
  ],
})
export class PaymentListComponent implements OnInit, OnDestroy {
  paymentDetails: PaymentDetails[] = [];
  private paymentDetailsSubscription: Subscription = new Subscription;
  numPaymentDetails!: number;
  isAdmin: boolean = false;

  dataSource!: MatTableDataSource<PaymentDetails>;
  displayedColumns: string[] = [
    'bankName',
    'branchCode',
    'accountNumber',
    'reference',
    'delete',
  ];

  errorMsg!: string;
  private errorSubscription: Subscription = new Subscription;

  isLoading: boolean = false;
  private isLoadingSubscription: Subscription = new Subscription;

  constructor(private paymentDetailsService: PaymentDetailsService) {}

  ngOnInit(): void {
    this.isLoading = true;
    const role = localStorage.getItem('role');
    this.isAdmin = role === 'admin' ? true : false;
    this.paymentDetailsService.getPaymentDetails();
    this.paymentDetailsSubscription = this.paymentDetailsService
      .getPaymentDetailsUpdateListener()
      .subscribe((paymentDetailsData: {paymentDetails: PaymentDetails[];paymentDetailsCount: number;}) => {
          this.paymentDetails = paymentDetailsData.paymentDetails;
          this.numPaymentDetails = paymentDetailsData.paymentDetailsCount;
          this.dataSource = new MatTableDataSource<PaymentDetails>(
            this.paymentDetails
          );
        }
      );

    //Stop spinner
    this.isLoadingSubscription = this.paymentDetailsService
      .getIsLoadingListener()
      .subscribe((isLoading) => {
        this.isLoading = isLoading;
      });

    this.errorSubscription = this.paymentDetailsService
      .getErrorListener()
      .subscribe((errorMsg) => {
        this.errorMsg = errorMsg.message;
      });
  }

  onDeletePAymentDetails(paymentDetailId: string) {
    Swal.fire({
      title: 'Are you sure you want to delete this item?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3F51B5',
      cancelButtonColor: '#F44336',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.paymentDetailsService.deletePaymentDetails(paymentDetailId);
      }
    });
  }

  ngOnDestroy(): void {
    this.paymentDetailsSubscription.unsubscribe();
    this.errorSubscription.unsubscribe();
    this.isLoadingSubscription.unsubscribe();
  }
}
