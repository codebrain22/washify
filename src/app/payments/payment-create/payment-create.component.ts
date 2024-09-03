import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { PaymentDetailsService } from '../paymentDetails.service';

import { PaymentDetails } from '../paymentDetails.model';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-payment-create',
  templateUrl: './payment-create.component.html',
  styleUrls: ['./payment-create.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule
  ],
})
export class PaymentCreateComponent implements OnInit, OnDestroy {

  bankNames = ['Absa', 'Capitec', 'Nedbank', 'FNB', 'Standard Bank'];

  errorMsg!: string;
  private errorSubscription!: Subscription;

  isLoading: boolean = false;
  private isLoadingSubscription!: Subscription;

  constructor(
    private paymentDetailsService: PaymentDetailsService,
  ) {}

  ngOnInit(): void {
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

  onAddPaymentDetails(form: NgForm) {
    if (form.invalid) {
      return;
    }
     Swal.fire({
       title: 'Proceed?',
       text: "You won't be able to update this payment details once they are created!",
       icon: 'question',
       showCancelButton: true,
       confirmButtonColor: '#3F51B5',
       cancelButtonColor: '#F44336',
       confirmButtonText: 'Yes, add it!',
     }).then((result) => {
       if (result.isConfirmed) {
         this.isLoading = true;
         const payment: PaymentDetails = {
           id: '',
           accountName: form.value.accountName,
           bankName: form.value.bankName,
           branchCode: form.value.branchCode,
           accountNumber: form.value.accountNumber,
           reference: form.value.reference,
         };
         this.paymentDetailsService.addPaymentDetails(payment);
         form.resetForm();
       }
     });
   
  }

  ngOnDestroy(): void {
    this.errorSubscription.unsubscribe();
    this.isLoadingSubscription.unsubscribe();
  }
}
