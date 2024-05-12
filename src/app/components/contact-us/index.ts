import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { BaseComponent } from '../../base/baseComponent';
import { UserService } from "../../services/user.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';

@Component({
  selector: '[contact-us]',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class ContactComponent extends BaseComponent implements OnInit {

  radioValue = 'A';
  
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
    roomType: FormControl<string>;
    roomStatus: FormControl<string>;
    roomName: FormControl<string>;
    numberOfFloors: FormControl<number>;
    area: FormControl<number>;
    duration: FormControl<string>;
    price: FormControl<number>;
    currencyUnit: FormControl<string>;
    deposit: FormControl<number>;
    electricPrice: FormControl<number>;
    waterPrice: FormControl<number>;
    directions: FormControl<string>;
    sameHouseWithOwner: FormControl<string>;
    renterRequirement: FormControl<string>;
    hasParkingArea: FormControl<string>;
    numberOfWashingMachine: FormControl<number>;
    numberOfAirConditioners: FormControl<number>;
    numberOfWaterHeaters: FormControl<number>;
    numberOfWardrobes: FormControl<number>;
    numberOfBathrooms: FormControl<number>;
    numberOfBedrooms: FormControl<number>;
    numberOfBeds: FormControl<number>;
    note: FormControl<string>;
    location: FormControl<string>;
    address: FormControl<string>;
  }> = this.fb.group({
    roomType: ['', [Validators.required]],
    roomStatus: ['', [Validators.required]],
    roomName: ['', [Validators.required]],
    numberOfFloors: [0],
    area: [0, [Validators.required]],
    duration: [''],
    price: [0, [Validators.required]],
    currencyUnit: [''],
    deposit: [0, [Validators.required]],
    electricPrice: [0],
    waterPrice: [0],
    directions: [''],
    sameHouseWithOwner: [''],
    renterRequirement: [''],
    hasParkingArea: [''],
    numberOfWashingMachine: [0],
    numberOfAirConditioners: [0],
    numberOfWaterHeaters: [0],
    numberOfWardrobes: [0],
    numberOfBathrooms: [0],
    numberOfBedrooms: [0],
    numberOfBeds: [0],
    note: [''],
    location: ['', [Validators.required]],
    address: ['', [Validators.required]],
  });

  override ngOnInit(): void {
    super.ngOnInit();
  }

  constructor(private notification: NzNotificationService,
    private router: Router,
    private userService: UserService,
    private fb: NonNullableFormBuilder,
    private zone: NgZone) {
      super(notification, router, userService);
  }

  onBtnAdd() {
    if (1) {
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
}
