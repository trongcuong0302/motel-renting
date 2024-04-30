import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { UserService } from "../../../services/user.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'src/app/base/baseComponent';

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
        this.showSuccess("Account verified successfully!");
      },
      error: (error) => this.showError(error.error.message)
    });
  }

  onLoginBtn() {
    window.open("http://localhost:4200/login")
  }

}
