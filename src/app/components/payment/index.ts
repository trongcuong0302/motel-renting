import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { BaseComponent } from '../../base/baseComponent';
import { UserService } from "../../services/user.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import { OrdersService } from 'src/app/services/orders.service';


@Component({
  selector: '[payment-component]',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class PaymentComponent extends BaseComponent implements OnInit {
  tabIndex: number = 0;
  isVisible: boolean = false;
  isConfirmAddBill: boolean = false;

  @Input() latLng = { lat: 21.0278, lng: 105.8342 };
  @Output() placeChanged = new EventEmitter();

  override ngOnInit(): void {
    super.ngOnInit();
  }

  constructor(private notification: NzNotificationService,
    private router: Router,
    private userService: UserService,
    private orderService: OrdersService) {
      super(notification, router, userService);
  }

  onTabIndexChange(index: number) {
    this.tabIndex = index;
  }

  openModal() {
    this.isVisible = true;
    this.isConfirmAddBill = false;
  }

  handleOk() {
    this.isConfirmAddBill = true;
  }

  handleCancel() {
    this.isVisible = false;
  }

  onAddUser() {
    this.isConfirmAddBill = false;
    this.isVisible = false;
  }

  onAddUserFail() {
    this.isConfirmAddBill = false;
  }

}
