import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/baseComponent';
import { AuthService } from "../../services/auth.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';

@Component({
  selector: '[topnav]',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class TopnavComponent extends BaseComponent implements OnInit {
  
  private _authUser: any = {};

  override ngOnInit(): void {
    super.ngOnInit();
    this.authService.auth.subscribe(user => {
      if(user.email){
        this.getUser();
      }
    })
    if(this.router.url != '/login' && !this.router.url.includes('/reset')) this.getUser();
    else if(this.isShowTopnav) this.router.navigate(['/products']);
  }

  constructor(private notification: NzNotificationService,
    private router: Router,
    private authService: AuthService) {
      super(notification, router, authService);
  }

  get isShowTopnav() {
    return this.isLoggedIn;
  }

  get authUser() {
    return this._authUser;
  }

  set authUser(value: any) {
    this._authUser = value;
  }

  getLabelUser() {
    return this.authUser.name;
  }

  getUser() {
    this.authService.getUser().subscribe({
      next: (data) => {
        this.authUser = data.data;
        this.isLoggedIn = true;
        if(this.router.url=='/login' || this.router.url.includes('/reset')) this.router.navigate(['/products']);
      },
      error: (error) => {
        this.isLoggedIn = false;
        if(!this.router.url.includes('/reset')) this.router.navigate(['/login']);
        if(this.router.url != '/login' && !this.router.url.includes('/reset')) this.showError(error.error.message);
      }
    });
  }

  onLogOut() {
    this.authService.logOut().subscribe({
      next: (data) => {
        this.isLoggedIn = false;
        this.router.navigate(['/login']);
      },
      error: (error) => this.showError(error.error.message)
    });
  }

  onBtnProfile() {
    this.router.navigate(['/profile']);
  }

}
