import { Component } from '@angular/core';
import { BannerComponent } from '../banner/banner.component';
import { FeaturesComponent } from '../features/features.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    BannerComponent,
    FeaturesComponent,
    ContactsComponent,
    FooterComponent,
  ],
})
export class HomeComponent {}
