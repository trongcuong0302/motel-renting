import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { UserService } from "../../../services/user.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'src/app/base/baseComponent';

@Component({
  selector: 'reset-password',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class ResetPasswordComponent extends BaseComponent implements OnInit {
  public errors = [];
  public isShowPassword: boolean = false;
  @Output() onLogin: EventEmitter<any> = new EventEmitter();

  validateForm: FormGroup<{
    password: FormControl<string>;
    confirmPassword: FormControl<string>;
  }> = this.fb.group({
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]],
  });
  
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
  }

  submitForm(): void {
    if (this.validateFormData()) {
      let resetObj = {
        token: this.token,
        password: this.validateForm.value.password
      }
      this.userService.resetPassword(resetObj).subscribe({
        next: (data) => {
          this.modal.success({
            nzTitle: 'Password changed successfully',
            nzContent: 'You can go to login page to sign in now.',
            nzOnOk: () => this.router.navigate(['/login'])
          });
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

  onLoginBtn() {
    this.router.navigate(['/login']);
  }

  validateFormData() {
    if(!this.validateForm.valid) return false;
    let data = this.validateForm.value;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    if(!data.password || !passwordRegex.test(data.password)){
      this.showError("Invaid password! Please enter a valid password.");
      return false;
    } 
    if(!data.confirmPassword || data.password != data.confirmPassword){
      this.showError("Confirm password must be similar to password!");
      return false;
    } 
    return true;
  }

}
