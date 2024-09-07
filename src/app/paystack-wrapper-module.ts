import { NgModule } from '@angular/core';
import { Angular4PaystackModule } from 'angular4-paystack';
import { environment } from '../environments/environment';

const PK_TEST_ID = environment.pk_key;

@NgModule({
  imports: [
    Angular4PaystackModule.forRoot(PK_TEST_ID), // Your Paystack public key
  ],
})
export class PaystackWrapperModule {}
