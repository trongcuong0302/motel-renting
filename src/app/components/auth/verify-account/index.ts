import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { UserService } from "../../../services/user.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'src/app/base/baseComponent';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'verify-account',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class VerifyAccountComponent extends BaseComponent implements OnInit {

  token: string = '';

  constructor(private fb: NonNullableFormBuilder,
    private modal: NzModalService,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private translateService: TranslateService,
    private router: Router,
    private notification: NzNotificationService,) {
    super(notification, router, userService);
  }

  override ngOnInit(): void {
    this.token = this.activatedRoute.snapshot.params["token"];
    let resetObj = {
      token: this.token
    }
    this.userService.verifyEmail(resetObj).subscribe({
      next: (data) => {
        this.showSuccess(this.translateService.instant("verify.success"));
      },
      error: (error) => {
        if(error.error.message == "Your account has already been activated or it does not exist!") this.showError(this.translateService.instant("verify.activated"))
        else if(error.error.message == "Something went wrong while verify account!") this.showError(this.translateService.instant("verify.activateError"))
        else if(error.error.message == "Verification link is expired. Please send a new request to verify your account!") 
          this.showError(this.translateService.instant("verify.expiredLink"))
      } 
    });
  }

  onLoginBtn() {
    window.open("http://localhost:4200/login")
  }

}
