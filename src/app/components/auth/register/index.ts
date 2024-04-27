import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { UserService } from "../../../services/user.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/base/baseComponent';

@Component({
  selector: '[register-form]',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class RegisterComponent extends BaseComponent implements OnInit {
  public errors = [];
  public isShowPassword:boolean = false;
  @Output() onLogin: EventEmitter<any> = new EventEmitter();

  validateForm: FormGroup<{
    name: FormControl<string>;
    email: FormControl<string>;
    password: FormControl<string>;
    phoneNumber: FormControl<string>;
    confirmPassword: FormControl<string>;
  }> = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
    phoneNumber: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]],
  });

  constructor(private fb: NonNullableFormBuilder,
    private userService: UserService,
    private router: Router,
    private notification: NzNotificationService) {
    super(notification, router, userService);
  }

  override ngOnInit(): void {
  }

  submitForm(): void {
    if (this.validateFormData()) {
      let formData = this.validateForm.value;
      this.userService.register(formData).subscribe({
        next: (data) => {
          this.showSuccess("Successfully registered!");
          delete formData.password;
          delete formData.confirmPassword;
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

  onLoginBtn() {
    this.onLogin.emit();
  }

  validateFormData() {
    if(!this.validateForm.valid) return false;
    let data = this.validateForm.value;
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    const phoneNumberRegex = /(((\+|)84)|0)(3|5|7|8|9)+([0-9]{8})\b/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    if(!data.email || !emailRegex.test(data.email)) {
      this.showError("Invaid email! Please enter a valid email address.");
      return false;
    }
    if(!data.phoneNumber || !phoneNumberRegex.test(data.phoneNumber)) {
      this.showError("Invaid phone number! Please enter a valid phone number.");
      return false;
    }
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
