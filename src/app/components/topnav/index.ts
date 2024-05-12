import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../../base/baseComponent';
import { UserService } from "../../services/user.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

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
    },
    {
      label: 'Contact Us',
      link: 'contact-us',
      isSelected: false,
    }
  ]
  language = 'Tiếng Việt';
  iconLang = "../../../assets/img/vietnam.png";
  languageList = [
    {
      value: "vi",
      label: "Tiếng Việt",
      icon: "../../../assets/img/vietnam.png"
    },
    {
      value: "en",
      label: "English",
      icon: "../../../assets/img/uk.png"
    }
  ]

  @Output() onGetUser: EventEmitter<any> = new EventEmitter();
  @Output() onGetUserDone: EventEmitter<any> = new EventEmitter();

  override ngOnInit(): void {
    super.ngOnInit();
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getLabelForArray();
    });
    if(!localStorage.getItem('lang')) localStorage.setItem('lang', 'vi');
    else if(localStorage.getItem('lang') == "en"){
      this.language = 'English';
      this.iconLang = "../../../assets/img/uk.png";
    }
    if(window.innerWidth <= 920) this.hideMenuIcon = true;
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

  getLabelForArray() {
    this.menuList[0].label = this.translateService.instant("user.motelListLabel");
    this.menuList[1].label = this.translateService.instant("user.addMotelLabel");
    this.menuList[2].label = this.translateService.instant("user.contactUsLabel");
  }

  constructor(private notification: NzNotificationService,
    private translateService: TranslateService,
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
        if(this.router.url != '/login' && !this.router.url.includes('/reset')) {
          if(error.error.message == "Unauthenticated") this.showError(this.translateService.instant("user.unauthenticated"))
          else if(error.error.message == "Not Found") this.showError(this.translateService.instant("user.notFoundAccount"))
        } 
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
    if(window.innerWidth <= 920) this.hideMenuIcon = true;
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
    this.router.navigate(['/login']);
    this.onSelectMenuItem(0);
  }

  onChangeLanguage(lang: any) {
    this.language = lang.label;
    this.iconLang = lang.icon;
    localStorage.setItem('lang', lang.value);
    this.translateService.use(lang.value);
  }

}
