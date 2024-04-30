import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../../base/baseComponent';
import { UserService } from "../../services/user.service";
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
      isSelected: false,
    },
    {
      label: 'Add Motel',
      link: 'add',
      isSelected: false,
    }
  ]

  @Output() onGetUser: EventEmitter<any> = new EventEmitter();
  @Output() onGetUserDone: EventEmitter<any> = new EventEmitter();

  override ngOnInit(): void {
    super.ngOnInit();
    if(window.innerWidth <= 685) this.hideMenuIcon = true;
    this.userService.auth.subscribe(user => {
      if(user.email){
        this.getUser();
      }
    })
    if(!window.location.href.includes('/login') && !window.location.href.includes('/reset') && !window.location.href.includes('/verify')){
      this.getUser();
    } 
    else if(this.isShowTopnav) {
      this.onSelectMenuItem(0);
      this.router.navigate(['/products']);
    } 
  }

  constructor(private notification: NzNotificationService,
    private router: Router,
    private userService: UserService) {
      super(notification, router, userService);
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
    this.onGetUser.emit();
    this.userService.getUser().subscribe({
      next: (data) => {
        this.authUser = data.data;
        if(this.authUser?.avatarInfo?.avatarUrl) this.avatarUrl = this.authUser?.avatarInfo?.avatarUrl;
        else this.avatarUrl = '../../../assets/img/default-avatar.jpg';
        this.isLoggedIn = true;
        this.onGetUserDone.emit();
        if(this.router.url == '/add') this.onSelectMenuItem(1);
        else if(this.router.url=='/login' || this.router.url.includes('/reset')) {
          this.onSelectMenuItem(0);
          this.router.navigate(['/products']);
        } 
        else if (this.router.url.includes('products')) {
          this.onSelectMenuItem(0);
        }
      },
      error: (error) => {
        this.isLoggedIn = false;
        this.onGetUserDone.emit();
        if(!this.router.url.includes('/reset')) this.router.navigate(['/login']);
        if(this.router.url != '/login' && !this.router.url.includes('/reset')) this.showError(error.error.message);
      }
    });
  }

  onLogOut() {
    this.userService.logOut().subscribe({
      next: (data) => {
        this.isLoggedIn = false;
        this.onSelectMenuItem(0);
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
