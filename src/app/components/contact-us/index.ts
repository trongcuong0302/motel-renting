import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, NgZone, HostListener } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { BaseComponent } from '../../base/baseComponent';
import { UserService } from "../../services/user.service";
import { FeedbackService } from "../../services/feedback.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: '[contact-us]',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class ContactComponent extends BaseComponent implements OnInit {

  radioValue = 'owner';
  isMobile: boolean = false;
  accountData: any = {};
  
  roomTypeList = [
    { label: 'Chung cư mini / Chung cư', value: 'apartment' },
    { label: 'Nhà nguyên căn', value: 'house' },
    { label: 'Phòng trọ', value: 'room' }
  ];
  roomStatusList = [
    { label: 'Còn trống', value: 'available' },
    { label: 'Cho ở ghép', value: 'combined' },
    { label: 'Đã cho thuê', value: 'rented' },
    { label: 'Không cho thuê', value: 'closed' }
  ];

  validateForm: FormGroup<{
    role: FormControl<string>;
    message: FormControl<string>;
  }> = this.fb.group({
    role: ['', [Validators.required]],
    message: ['']
  });

  override ngOnInit(): void {
    super.ngOnInit();
    if(window.innerWidth <= 768) this.isMobile = true;
    this.getUser();
  }

  constructor(private notification: NzNotificationService,
    private router: Router,
    private userService: UserService,
    private feedbackService: FeedbackService,
    private translateService: TranslateService,
    private fb: NonNullableFormBuilder,
    private zone: NgZone) {
      super(notification, router, userService);
  }

  getUser() {
    this.isLoading = true;
    this.userService.getUser().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.accountData = data.data;
      },
      error: (error) => {
        this.isLoading = false;
        if(error.error.message == "Unauthenticated") this.showError(this.translateService.instant("user.unauthenticated"))
        else if(error.error.message == "Not Found") this.showError(this.translateService.instant("user.notFoundAccount"))
      }
    });
  }

  clearData() {
    for(let key in this.validateForm.controls) {
      this.validateForm.get(key)?.setValue('');
    }
    Object.values(this.validateForm.controls).forEach(control => {
      if (control.invalid) {
        control.markAsUntouched();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }

  onBtnAdd() {
    if (this.validateFormData()) {
      let formData: any = this.validateForm.value;
      formData['userId'] = this.accountData._id;
      formData['userName'] = this.accountData.name;
      formData['userEmail'] = this.accountData.email;
      formData['userPhone'] = this.accountData.phoneNumber;
      this.isLoading = true;
      this.feedbackService.postAFeedback(formData).subscribe({
        next: (data) => {
          this.isLoading = false;
          this.clearData();
          this.showSuccess(this.translateService.instant("contact.addSuccess"))
        },
        error: (error) => {
          this.isLoading = false;
          if(error.error.message == "Invalid data") this.showError(this.translateService.instant("add.invalidData"))
        }
      })
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
  }

  validateFormData() {
    for(let key of ['role', 'message']) {
      if(!this.validateForm.get(key)?.value) {
        this.showError(this.translateService.instant("add.requireField"));
        return false;
      }
    }
    return true;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if(window.innerWidth <= 768) this.isMobile = true;
    else this.isMobile = false;
  }
}
