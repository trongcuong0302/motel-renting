import { Component, OnInit, HostListener } from '@angular/core';
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
  hideMenuIcon: boolean = false;
  hideMenu: boolean = false;
  avatarUrl = '../../../assets/img/default-avatar.jpg';
  menuList = [
    {
      label: 'Motels List',
      link: 'products',
      isSelected: true,
    },
    {
      label: 'Add Motel',
      link: 'add',
      isSelected: false,
    }
  ]

  override ngOnInit(): void {
    super.ngOnInit();
    if(window.innerWidth <= 685) this.hideMenuIcon = true;
    this.authService.auth.subscribe(user => {
      if(user.email){
        this.getUser();
      }
    })
    if(this.router.url != '/login' && !this.router.url.includes('/reset')) this.getUser();
    else if(this.isShowTopnav) {
      this.onSelectMenuItem(0);
      this.router.navigate(['/products']);
    } 
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
        if(this.authUser?.avatarInfo?.avatarUrl) this.avatarUrl = this.authUser?.avatarInfo?.avatarUrl;
        this.isLoggedIn = true;
        this.onSelectMenuItem(0);
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
    this.onSelectMenuItem(-1);
    this.router.navigate(['/profile']);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if(window.innerWidth <= 685) this.hideMenuIcon = true;
    else this.hideMenuIcon = false;
  }

  onSelectMenuItem(index: number) {
    if(index < 0) {
      this.menuList.forEach((item) => item.isSelected = false);
    } else {
      for(let i = 0; i < this.menuList.length; i++) {
        if(i == index) this.menuList[i].isSelected = true;
        else this.menuList[i].isSelected = false;
      }
    }
    this.hideMenu = false;
  }

  toggleMenu() {
    this.hideMenu = !this.hideMenu;
  }

  goHomePage() {
    this.router.navigate(['/products']);
    this.onSelectMenuItem(0);
  }

}
