import { ServiceRequest } from './../service-requests.model';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { User } from '../../users/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-service-view',
  templateUrl: './service-view.component.html',
  styleUrls: ['./service-view.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
})
export class ServiceViewComponent implements OnInit {
  message!: string;
  user!: User;

  constructor(
    public dialogRef: MatDialogRef<ServiceViewComponent>,
    @Inject(MAT_DIALOG_DATA) public service: ServiceRequest
  ) { }

  ngOnInit(): void {
    this.user = this.service.owner
      ? JSON.parse(JSON.stringify(this.service.owner))
      : JSON.parse(JSON.stringify(this.service.onceOff));
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
