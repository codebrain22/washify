import { Router } from '@angular/router';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../../user.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.css'],
  standalone: true,
  imports: [CommonModule, MatDialogModule]
})
export class SubscribeComponent {
  currency = 'ZAR';
  reference = `ref-${Math.ceil(Math.random() * 10e13)}`;

  constructor(
    private userService: UserService,
    private router:Router,
    public dialogRef: MatDialogRef<SubscribeComponent>,
    @Inject(MAT_DIALOG_DATA)
    public subscription: {
      email: string;
      serviceName: string;
      interval: string;
      amount: number;
      plan: string;
    }
  ) {
    dialogRef.disableClose = true;
  }

  paymentCancel() {
    this.reference = `ref-${Math.ceil(Math.random() * 10e13)}`;
  }

  paymentDone(ref: any) {
    if (ref.status === 'success') {
      this.userService.updateMe({ subscription: this.subscription.serviceName, email: this.subscription.email });
      this.dialogRef.close();
      this.router.navigate(['/dashboard/my-profile']);
    }
  }
}
