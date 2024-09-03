import { Router } from '@angular/router';
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../users/user.service';
import { MatDialog } from '@angular/material/dialog';
import { GetOnceOffComponent } from './get-once-off/get-once-off.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

type ServiceType = { [key: string]: { [key: string]: string } };

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css'],
  standalone: true,
  imports: [CommonModule, MatIconModule],
})
export class FeaturesComponent implements OnInit, OnDestroy {
  @Input() userIsAuthenticated = false;
  @Output() serviceSubscription = new EventEmitter<string>();

  showSkipButton = false;

  errorMsg!: string;
  private errorSubscription!: Subscription;

  isLoading = false;
  private isLoadingSubscription!: Subscription;

  serviceTypes: ServiceType = {
    basic: {
      subscription: 'a basic service for R659/pm',
      onceOff: "You'll be charge only R35 per kg - Wash, Dry & Fold.",
    },
    advanced: {
      subscription: 'an advanced service for R829/pm',
      onceOff: "You'll be charge only R55 per kg - Wash, Dry, Iron & Fold.",
    },
    premium: {
      subscription: 'a premium service for R719/pm',
      onceOff: "You'll be charge only R40 per kg - Iron Only.",
    },
  };

  @ViewChild('flipCardBasic')
  flipCardBasic!: ElementRef;
  @ViewChild('flipCardInnerBasic')
  flipCardInnerBasic!: ElementRef;

  @ViewChild('flipCardAdvanced')
  flipCardAdvanced!: ElementRef;
  @ViewChild('flipCardInnerAdvanced')
  flipCardInnerAdvanced!: ElementRef;

  @ViewChild('flipCardPremium')
  flipCardPremium!: ElementRef;
  @ViewChild('flipCardInnerPremium')
  flipCardInnerPremium!: ElementRef;

  showRecommendedBadge = true;

  constructor(
    public dialog: MatDialog,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoadingSubscription = this.userService
      .getIsLoadingListener()
      .subscribe((isLoading) => {
        this.isLoading = isLoading;
      });

    this.errorSubscription = this.userService
      .getErrorListener()
      .subscribe((errorMsg) => {
        this.errorMsg = errorMsg.message;
      });
  }

  onServiceSubscription(serviceType: string) {
    if (this.userIsAuthenticated) {
      this.serviceSubscription.emit(serviceType);
    } else {
      this.router.navigate(['/signin']);
    }
  }

  onGetOnceOffDialog(serviceType: string): void {
    let serviceTypeTemp =
      this.serviceTypes[serviceType.toLocaleLowerCase() as keyof ServiceType];
    // Service to pass to the dialog
    let service = {
      name: serviceType,
      description: serviceTypeTemp['onceOff'],
    };

    this.dialog.open(GetOnceOffComponent, {
      panelClass: 'dialog-responsive',
      autoFocus: false,
      hasBackdrop: false,
      data: service,
    });
  }

  // Front end
  onViewMore(serviceType: string) {
    // Hide badge
    this.showRecommendedBadge = false;

    switch (serviceType) {
      case 'basic':
        this.flipCardBasic.nativeElement.classList.add('flip-card-hover');
        this.flipCardInnerBasic.nativeElement.classList.add(
          'flip-card-inner-transform'
        );
        break;
      case 'advanced':
        this.flipCardAdvanced.nativeElement.classList.add('flip-card-hover');
        this.flipCardInnerAdvanced.nativeElement.classList.add(
          'flip-card-inner-transform'
        );
        break;
      case 'premium':
        this.flipCardPremium.nativeElement.classList.add('flip-card-hover');
        this.flipCardInnerPremium.nativeElement.classList.add(
          'flip-card-inner-transform'
        );
        break;
    }
  }

  onCancel(serviceType: string) {
    // Show badge
    this.showRecommendedBadge = true;

    switch (serviceType) {
      case 'basic':
        this.flipCardBasic.nativeElement.classList.remove('flip-card-hover');
        this.flipCardInnerBasic.nativeElement.classList.remove(
          'flip-card-inner-transform'
        );
        break;
      case 'advanced':
        this.flipCardAdvanced.nativeElement.classList.remove('flip-card-hover');
        this.flipCardInnerAdvanced.nativeElement.classList.remove(
          'flip-card-inner-transform'
        );
        break;
      case 'premium':
        this.flipCardPremium.nativeElement.classList.remove('flip-card-hover');
        this.flipCardInnerPremium.nativeElement.classList.remove(
          'flip-card-inner-transform'
        );
        break;
    }
  }

  ngOnDestroy(): void {
    this.errorSubscription.unsubscribe();
    this.isLoadingSubscription.unsubscribe();
    this.showSkipButton = false;
  }
}
