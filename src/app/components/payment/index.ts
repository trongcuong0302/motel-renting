import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { BaseComponent } from '../../base/baseComponent';
import { UserService } from "../../services/user.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import { OrdersService } from 'src/app/services/orders.service';
import { TranslateService } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: '[payment-component]',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class PaymentComponent extends BaseComponent implements OnInit {
  tabIndex: number = 0;
  isVisible: boolean = false;
  isConfirmAddBill: boolean = false;
  isEditBill: boolean = false;
  formBill: any = {};
  userData: any = {};
  billData: any = [];
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
    private orderService: OrdersService,
    private modal: NzModalService) {
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

    if(this.isAdmin) filter.push({field: "admin", value: 'admin', operator: "admin"});
    if(this.tabIndex == 1) filter.push({field: "status", value: 'paid', operator: "matches"});
    if(this.tabIndex == 2) filter.push({field: "status", value: 'unpaid', operator: "matches"});

    this.isLoading = true;
    this.orderService.getAllOrder(filter).subscribe({
      next: (data) => {
        this.billData = data?.data;
        this.billData = this.billData.filter((bill: any) => bill?.user?.name)
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
    this.getAllBill();
  }

  openModal() {
    this.isVisible = true;
    this.isConfirmAddBill = false;
    if(!this.isEditBill) this.formBill = {};
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
    return bill.status == 'unpaid' && this.isRenter(bill)
  }

  onPay(bill: any) {
    window.open(bill.vnpUrl);
  }

  confirmDelete(bill: any) {
    if(this.isLoading) return;
    this.modal.confirm({
      nzTitle: this.translateService.instant("payment.deleteConfirm"),
      nzOkText: this.translateService.instant("add.yes"),
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: this.translateService.instant("add.no"),
      nzOnOk: () => this.deleteBill(bill)
    });
  }

  deleteBill(bill: any) {
    this.isLoading = true;
    this.orderService.deleteOrderById(bill._id).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.showSuccess(this.translateService.instant("payment.deleteSuccess"));
        this.getAllBill();
      },
      error: (error) => {
        this.isLoading = false;
        if(error.error.message == "Not Found") this.showError(this.translateService.instant("payment.addNotFound"))
      } 
    });
  }

  confirmUpdate(index: number) {
    this.isEditBill = true;
    this.formBill = this.billData[index];
    this.openModal();
  }

  isOwner(bill: any) {
    return bill.userId == this.userData._id;
  }

  get isAdmin() {
    return this.userData.role == 0;
  }

  isRenter(bill: any) {
    let list = bill.motel.renters || [];
    let i = list.findIndex((r: any) => r._id === this.userData._id);

    return i >= 0;
  }
}
