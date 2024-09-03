import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { User } from '../user.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.css'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
})
export class UserViewComponent implements OnInit {
  notSubscribed: string = 'CURRENTLY NOT SUBSCRIBED TO ANY SERVICE';
  subscribed!: string;
  constructor(
    public dialogRef: MatDialogRef<UserViewComponent>,
    @Inject(MAT_DIALOG_DATA) public user: User
  ) {}

  ngOnInit(): void {
    this.subscribed = `CURRENTLY SUBSCRIBED TO ${this.user.subscription}`;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
