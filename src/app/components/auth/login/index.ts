import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { UserService } from "../../../services/user.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/base/baseComponent';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: '[login-form]',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class LoginComponent extends BaseComponent implements OnInit {
  isVisible = false;
  isShowPassword = false;
  emailReset: string = '';

  @Output() onRegister: EventEmitter<any> = new EventEmitter();

  override ngOnInit(): void {
      super.ngOnInit();
      this.getUser();
  }

  constructor(private fb: NonNullableFormBuilder,
    private modal: NzModalService,
    private userService: UserService,
    private translateService: TranslateService,
    private router: Router,
    private notification: NzNotificationService) {
    super(notification, router, userService);
  }

  validateForm: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }> = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  getUser() {
    this.userService.getUser().subscribe({
      next: (data) => {
        this.router.navigate(['/products']);
        this.userService.nextUser(data.data);
      },
      error: (error) => {
        this.isLoggedIn = false;
        console.log(error.error.message);
      }
    });
  }

  submitForm(): void {
    if (this.validateFormData()) {
      let formData = this.validateForm.value;
      this.userService.login(formData).subscribe({
        next: (data) => {
          this.userService.nextUser(formData);
          this.router.navigate(['/products']);
        },
        error: (error) => {
          if(error.error.message == "Not found email or phone number") this.showError(this.translateService.instant("login.notFoundEmail"))
          else if(error.error.message == "Password is incorrect") this.showError(this.translateService.instant("login.incorrectPassword"))
          else if(error.error.message == "Your account is inactive. Please verify your account in your email message.") 
            this.showError(this.translateService.instant("login.inactiveAccount"))
        }
      });
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  validateFormData() {
    if(!this.validateForm.valid) return false;
    let data = this.validateForm.value;
    if(!data.email) {
      this.showError(this.translateService.instant("login.errorEmptyEmail"));
      return false;
    }
    return true;
  }

  onRegisterBtn() {
    this.onRegister.emit();
  }

  onBtnForgotPassword(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if(!this.emailReset || !emailRegex.test(this.emailReset)) {
      this.showError(this.translateService.instant("login.errorEmailInvalid"));
    }
    else {
      let objEmail: any = {
        email: this.emailReset,
        language: localStorage.getItem('lang') || 'vi'
      }
      this.userService.sendMailResetPassword(objEmail).subscribe({
        next: (data) => {
          this.modal.success({
            nzTitle: this.translateService.instant("login.sendEmailSuccessTitle"),
            nzContent: this.translateService.instant("login.sendEmailSuccessContent")
          });
          this.isVisible = false;
        },
        error: (error) => this.showError(this.translateService.instant("login.sendMailError"))
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

}
