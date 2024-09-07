import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ServiceRequestService } from './../service-request.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../authentication/auth.service';
import { User } from '../../users/user.model';
import { UserService } from '../../users/user.service';
import {MatRadioModule} from '@angular/material/radio'; 
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ServiceRequest } from '../service-requests.model';

@Component({
  selector: 'app-service-create',
  templateUrl: './service-create.component.html',
  styleUrls: ['./service-create.component.css'],
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
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
})
export class ServiceCreateComponent implements OnInit, OnDestroy {

  showAlerts = true;
  private userId!: string;
  user!: User;
  private userListenerSubs!: Subscription;
  todayDate = new Date();
  serviceTypes = [
    {
      name: 'Basic',
      price: 35 * 100,
      description: 'Basic: R35 per kg - Wash, Dry & Fold',
    },
    {
      name: 'Premium',
      price: 40 * 100,
      description: 'Premium: R40 per kg - Iron Only',
    },
    {
      name: 'Advanced',
      price: 55 * 100,
      description: 'Advanced: R55 per kg - Wash, Dry, Iron & Fold',
    },
  ];

  selectedServiceType: any = {};
  // paymentRequest: google.payments.api.PaymentDataRequest;

  paymentMethods = ['In-app payment', 'Cash on delivery'];
  //Load only on update
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

  errorMsg!: string;
  private errorSubscription!: Subscription;

  isLoading: boolean = false;
  private isLoadingSubscription!: Subscription;

  locked = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private serviceRequestService: ServiceRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.userId = this.authService.getUserId() ?? '';
    this.userService.getUser(this.userId);
    this.userListenerSubs = this.userService
      .getUserUpdateListener()
      .subscribe((user) => {
        this.user = user;
        this.isLoading = false;
      });
    this.isLoadingSubscription = this.serviceRequestService
      .getIsLoadingListener()
      .subscribe((isLoading) => {
        this.isLoading = isLoading;
      });
    this.errorSubscription = this.serviceRequestService
      .getErrorListener()
      .subscribe((errorMsg) => {
        this.errorMsg = errorMsg.message;
      });

    setTimeout(() => {
      this.showAlerts = false;
    }, 8000);

  }

  onSendRequest(form: NgForm) {
    // Check if form is valid
    if (form.invalid) {
      return;
    }

    //If user not subscribed, get service chosen - once off
    if (!this.user.subscription) {
      this.selectedServiceType = this.serviceTypes.find(
        (s) => s.name === form.value.serviceType
      );
    }

    // Show confirm dialogue
    Swal.fire({
      title: 'Place order',
      text: "You won't be able to update this order once it is created!",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3F51B5',
      cancelButtonColor: '#F44336',
      confirmButtonText: 'Yes, proceed',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        
        const service: ServiceRequest  = {
          _id: undefined,
          serviceType: this.selectedServiceType.name || this.user.subscription,
          reference: form.value.reference,
          pickupTime: form.value.pickupTime,
          paymentMethod: form.value.paymentMethod || 'Monthly subscription',
          paymentStatus: this.user.subscription ? 'Monthly' : 'Pending',
          status: this.status[0],
          requestedOn: new Date(Date.now()).toISOString(),
          returnedOn: undefined,
          owner: this.userId,
          onceOff: undefined
        };
        
        //Request a service
        this.serviceRequestService.addService(service, undefined);
      }
    })
  }

  ngOnDestroy(): void {
    this.userListenerSubs.unsubscribe();
    this.isLoadingSubscription.unsubscribe();
    this.errorSubscription.unsubscribe();
  }
}
