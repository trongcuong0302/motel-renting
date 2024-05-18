import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { UserService } from "../../../services/user.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/base/baseComponent';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: '[add-bill]',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class AddBill extends BaseComponent implements OnInit {
  public errors = [];
  public isShowPassword:boolean = false;
  _confirm: boolean = false;
  get confirm() {
    return this._confirm;
  }
  @Input() set confirm(value) {
    this._confirm = value;
    if(this.confirm) this.submitForm();
    else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsUntouched();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  roleList = [
    { label: 'Quản trị viên', value: 0 },
    { label: 'Người dùng', value: 1 }
  ]
  @Output() onAddUser: EventEmitter<any> = new EventEmitter();
  @Output() onAddUserFail: EventEmitter<any> = new EventEmitter();

  validateForm: FormGroup<{
    name: FormControl<string>;
    email: FormControl<string>;
    password: FormControl<string>;
    phoneNumber: FormControl<string>;
    confirmPassword: FormControl<string>;
    role: FormControl<number>;
  }> = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
    phoneNumber: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]],
    role: [1, [Validators.required]]
  });

  constructor(private fb: NonNullableFormBuilder,
    private userService: UserService,
    private translateService: TranslateService,
    private router: Router,
    private notification: NzNotificationService,
    private modal: NzModalService) {
    super(notification, router, userService);
  }

  override ngOnInit(): void {
  }

  submitForm(): void {
    if (this.validateFormData()) {
      let formData: any = this.validateForm.value;
      this.userService.postAnUser(formData).subscribe({
        next: (data) => {
          this.showSuccess(this.translateService.instant("userList.addUserSuccess"));
          this.onAddUser.emit();
        },
        error: (error) => {
          if(error.error.message == "Duplicate Email") this.showError(this.translateService.instant("register.duplicateEmail"))
          else if(error.error.message == "Duplicate phone number") this.showError(this.translateService.instant("register.duplicatePhone"))
          else if(error.error.message == "Email not found") this.showError(this.translateService.instant("register.notFoundEmail"))
          this.onAddUserFail.emit();
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
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    const phoneNumberRegex = /(((\+|)84)|0)(3|5|7|8|9)+([0-9]{8})\b/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    if(!data.email || !emailRegex.test(data.email)) {
      this.showError(this.translateService.instant("register.invalidEmail"));
      return false;
    }
    if(!data.phoneNumber || !phoneNumberRegex.test(data.phoneNumber)) {
      this.showError(this.translateService.instant("register.invalidPhone"));
      return false;
    }
    if(!data.password || !passwordRegex.test(data.password)){
      this.showError(this.translateService.instant("register.invalidPassword"));
      return false;
    } 
    if(!data.confirmPassword || data.password != data.confirmPassword){
      this.showError(this.translateService.instant("register.invalidConfirmPassword"));
      return false;
    } 
    return true;
  }

}
