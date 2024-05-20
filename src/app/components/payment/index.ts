import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { BaseComponent } from '../../base/baseComponent';
import { UserService } from "../../services/user.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import { OrdersService } from 'src/app/services/orders.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: '[payment-component]',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class PaymentComponent extends BaseComponent implements OnInit {
  tabIndex: number = 0;
  isVisible: boolean = false;
  isConfirmAddBill: boolean = false;
  userData: any = {};
  billData: any = {};
  pageSize = 10;
  pageIndex = 1;
  total = 1;

  @Input() latLng = { lat: 21.0278, lng: 105.8342 };
  @Output() placeChanged = new EventEmitter();

  override ngOnInit(): void {
    super.ngOnInit();
    this.getUserProfile();
  }

  constructor(private notification: NzNotificationService,
    private router: Router,
    private translateService: TranslateService,
    private userService: UserService,
    private orderService: OrdersService) {
      super(notification, router, userService);
  }

  getUserProfile() {
    this.isLoading = true;
    this.userService.getUser().subscribe({
      next: (data) => {
        this.userData = data?.data;
        this.isLoading = false;
        this.getAllBill();
      },
      error: (error) => {
        this.isLoading = false;
        if(error.error.message == "Unauthenticated") this.showError(this.translateService.instant("user.unauthenticated"))
        else if(error.error.message == "Not Found") this.showError(this.translateService.instant("user.notFoundAccount"))
      }
    });
  }

  getAllBill() {
    let filter = [
      {field: "pageIndex", value: this.pageIndex, operator: "pagination"},
      {field: "pageSize", value: this.pageSize, operator: "pagination"},
      {field: "user", value: this.userData, operator: "includes"},
      {field: "createdDate", value: 'descend', operator: "sort"},

    ];
    this.isLoading = true;
    this.orderService.getAllOrder(filter).subscribe({
      next: (data) => {
        this.billData = data?.data;
        this.total = data?.total;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        if(error.error.message == "Unauthenticated") this.showError(this.translateService.instant("user.unauthenticated"))
        else if(error.error.message == "Not Found") this.showError(this.translateService.instant("user.notFoundAccount"))
      }
    });
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

  onAddBill() {
    this.isConfirmAddBill = false;
    this.isVisible = false;
    this.getAllBill();
  }

  onAddBillFail() {
    this.isConfirmAddBill = false;
  }

  onChangePageIndex() {
    this.getAllBill();
  }

  getFormValue(key: string, bill: any) {
    if(key == 'expiryDate') {
      let date = new Date(bill[key]);
      return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
    }
    if(key == 'amount') {
      return this.formatDisplayMoney(bill[key]);
    }
    if(key == 'status') {
      if(bill[key] == 'paid') return this.translateService.instant("payment.paidStatus");
      if(bill[key] == 'unpaid') return this.translateService.instant("payment.unpaidStatus");
    }
    return;
  }

  formatDisplayMoney(amount: any) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  isShowBtnPay(bill: any) {
    return bill.status == 'unpaid' && this.userData._id != bill.user._id;
  }

  onPay(bill: any) {
    window.open(bill.vnpUrl);
  }

}
