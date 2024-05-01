import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { UserService } from "../../../services/user.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/base/baseComponent';

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
        error: (error) => this.showError(error.error.message)
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
      this.showError("Please input email or phone number.");
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
      this.showError("Invaid email! Please enter a valid email address.");
    }
    else {
      this.userService.sendMailResetPassword(this.emailReset).subscribe({
        next: (data) => {
          this.modal.success({
            nzTitle: 'Send email successfully',
            nzContent: 'An instruction has been sent to your email address. Please check your email and follow the instructions to reset your password.'
          });
          this.isVisible = false;
        },
        error: (error) => this.showError(error.error.message)
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

}
