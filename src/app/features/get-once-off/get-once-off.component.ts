import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { ServiceRequestService } from '../../service-requests/service-request.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker'; 
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-get-once-off',
  templateUrl: './get-once-off.component.html',
  styleUrls: ['./get-once-off.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule
  ],
})
export class GetOnceOffComponent implements OnInit {
  todayDate = new Date();
  status = [
    'Pending collection',
    'Collected',
    'Washing',
    'Drying',
    'Ironing',
    'Folding',
    'Returned',
    'Cancelled',
  ];

  errorMsg?: string;
  private errorSubscription!: Subscription;

  isLoading: boolean = false;
  private isLoadingSubscription!: Subscription;

  constructor(
    public dialogRef: MatDialogRef<GetOnceOffComponent>,
    @Inject(MAT_DIALOG_DATA)
    public service: { name: string; description: string },
    private serviceRequestService: ServiceRequestService
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
     this.isLoadingSubscription = this.serviceRequestService
       .getIsLoadingListener()
       .subscribe((isLoading: boolean) => {
         this.isLoading = isLoading;
       });
    this.errorSubscription = this.serviceRequestService
      .getErrorListener()
      .subscribe((errorMsg: {message: string}) => {
        this.errorMsg = errorMsg?.message as string;
      });
  }

  onGetOnceOff(form: NgForm) {
    this.showLoader();
    if (form.invalid) {
      return;
    }

    const user = {
      preferredName: form.value.preferredName,
      address: form.value.address,
      email: form.value.email,
      phone: form.value.phone,
    };

    const userService = {
      id: '',
      serviceType: this.service.name,
      reference: '',
      pickupTime: form.value.pickupTime,
      paymentMethod: 'Cash on delivery',
      paymentStatus: 'Pending',
      status: this.status[0],
      requestedOn: new Date(Date.now()).toISOString(),
      returnedOn: '',
      onceOff: '',
      owner: ''
    };

    this.serviceRequestService.addService(userService, undefined);
    form.resetForm();
  }

  showLoader() {
    let timerInterval;
    Swal.fire({
      title: 'Requesting a service!',
      html: 'Please wait...',
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      },
      willClose: () => {},
    }).then((result) => {
      /* Read more about handling dismissals below */
      if (result.dismiss === Swal.DismissReason.timer) {
        if (!this.errorMsg) {
          Swal.fire(
            'Request Received!',
            "We'll get back to you in a moment",
            'success'
          );
        } else {
          Swal.fire(
            'Request Failed!',
            'Error occurred while sending the request!',
            'error'
          );
          this.errorMsg = undefined;
        }
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.isLoadingSubscription.unsubscribe();
    this.errorSubscription.unsubscribe();
  }
}
