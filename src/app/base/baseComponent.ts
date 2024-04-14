import { OnInit, Component } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from "../services/auth.service";
import { Router } from '@angular/router';

@Component({
  template: ''
})

export class BaseComponent implements OnInit {
  public isLoading = false;
  public isLoggedIn = false;

  constructor(private notify: NzNotificationService,
    private route: Router,
    private auth: AuthService) {
  }

  ngOnInit(): void {
    // if(this.authUser.name) this.route.navigate(['/products'])
    // if(this.route.url != '/' && this.route.url != '/login' && this.route.url != '/register') this.getUser()
    // console.log(this.route.url)
  }

  showError(message: string) {
    this.notify.create('error','Error',message);
  }

  showSuccess(message: string) {
    this.notify.create('success','Success',message);
  }

}