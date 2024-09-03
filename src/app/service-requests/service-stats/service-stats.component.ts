import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ServiceRequestService } from '../service-request.service';
import { ServiceRequest } from '../service-requests.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-service-stats',
  templateUrl: './service-stats.component.html',
  styleUrls: ['./service-stats.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
  ],
})
export class ServiceStatsComponent implements OnInit, OnDestroy {
  totalServices: number = 0;
  stats!: { basic: number; advanced: number; premium: number; total: number; };
  gaugeType = 'semi';
  gaugeValue = 28.3;
  gaugeAppendText: any;
  thickValue = 4;
  foregroundColor = '#303F9F';

  private serviceSubscription: Subscription | undefined;

  constructor(private serviceService: ServiceRequestService) {}

  ngOnInit(): void {
    this.serviceSubscription = this.serviceService
      .getServicesUpdateListener()
      .subscribe(
        (serviceData: {
          services: ServiceRequest[];
          servicesCount: number;
        }) => {
          this.totalServices = serviceData.servicesCount;
          this.stats = this.reportStats(serviceData.services);
          // this.gaugeAppendText = `/${this.totalServices}`;
        }
      );
  }

  reportStats(services: ServiceRequest[]) {
    let basic = 0;
    let advanced = 0;
    let premium = 0;

    services.forEach((service) => {
      if (service.serviceType.includes('Basic')) {
        basic += 1;
      } else if (service.serviceType.includes('Advanced')) {
        advanced += 1;
      } else {
        premium += 1;
      }
    });

    return {
      basic: basic,
      advanced: advanced,
      premium: premium,
      total: this.totalServices,
    };
  }

  ngOnDestroy(): void {
    this.serviceSubscription?.unsubscribe();
  }
}
