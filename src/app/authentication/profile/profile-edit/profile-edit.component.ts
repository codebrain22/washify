import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../../../users/user.service';
import { User } from '../../../users/user.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatInputModule} from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css'],
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
    MatChipsModule,
    MatDialogModule,
  ],
})
export class ProfileEditComponent implements OnInit {
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  socialProfiles: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<ProfileEditComponent>,
    @Inject(MAT_DIALOG_DATA) public user: User,
     private userService: UserService
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.socialProfiles = this.user.socialMediaHandles;
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.socialProfiles.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(profile: string): void {
    const index = this.socialProfiles.indexOf(profile);

    if (index >= 0) {
      this.socialProfiles.splice(index, 1);
    }
  }

  onEditProfile(form: NgForm) {
    if (form.invalid) {
      return;
    }
     const user = {
       preferredName: form.value.preferredName,
       address: form.value.address,
       socialMediaHandles: this.socialProfiles,
       email: form.value.email,
       phone: form.value.phone,
     };
    this.userService.updateMe(user);
    form.resetForm();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
