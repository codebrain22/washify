import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../user.model';
import { UserService } from '../user.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { NgxGaugeModule } from 'ngx-gauge';

@Component({
  selector: 'app-user-stats',
  templateUrl: './user-stats.component.html',
  styleUrls: ['./user-stats.component.css'],
  standalone: true,
  imports: [CommonModule, MatCardModule, NgxGaugeModule]
})
export class UserStatsComponent implements OnInit, OnDestroy {
  totalUsers: number = 0;
  stats!: { users: number; administrators: number; total: number; };
  gaugeType = 'semi';
  gaugeValue = 28.3;
  gaugeAppendText: any;
  thickValue = 4;
  foregroundColor = '#303F9F';

  private userSubscription!: Subscription;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userSubscription = this.userService
      .getUsersUpdateListener()
      .subscribe((userData: { users: User[]; usersCount: number }) => {
        this.totalUsers = userData.usersCount;
        this.stats = this.reportStats(userData.users);
      });
  }

  reportStats(services: User[]) {
    let users = 0;
    let admins = 0;

    services.forEach((user) => {
      if (user.role === 'user') {
        users += 1;
      } else {
        admins += 1;
      }
    });

    return {
      users: users,
      administrators: admins,
      total: this.totalUsers,
    };
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
