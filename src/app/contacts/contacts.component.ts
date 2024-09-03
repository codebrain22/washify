import { Component } from '@angular/core';

interface Enquiry {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css'],
  standalone: true,
})
export class ContactsComponent {}
