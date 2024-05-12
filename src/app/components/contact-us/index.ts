import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, NgZone, HostListener } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { BaseComponent } from '../../base/baseComponent';
import { UserService } from "../../services/user.service";
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
    message: ['', [Validators.required]]
  });

  override ngOnInit(): void {
    super.ngOnInit();
    if(window.innerWidth <= 768) this.isMobile = true;
  }

  constructor(private notification: NzNotificationService,
    private router: Router,
    private userService: UserService,
    private translateService: TranslateService,
    private fb: NonNullableFormBuilder,
    private zone: NgZone) {
      super(notification, router, userService);
  }

  onBtnAdd() {
    if (this.validateFormData()) {
      console.log(this.validateForm.value)
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
