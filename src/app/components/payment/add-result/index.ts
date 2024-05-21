import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { UserService } from "../../../services/user.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'src/app/base/baseComponent';
import { TranslateService } from '@ngx-translate/core';
import { ProductsService } from 'src/app/services/products.service';
import { OrdersService } from 'src/app/services/orders.service';

@Component({
  selector: '[add-bill-result]',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class AddBillResult extends BaseComponent implements OnInit {
  public expiredDate: Date = new Date();
  public vnp_params: any = {};
  public billData: any = {};
  public userData: any = {};
  public motelData: any = {};
  public code: any = '';

  constructor(private fb: NonNullableFormBuilder,
    private productsService: ProductsService,
    private userService: UserService,
    private ordersService: OrdersService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NzNotificationService,
    private modal: NzModalService) {
    super(notification, router, userService);
    this.route.queryParams.subscribe(params => {
      this.vnp_params = params;
  });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.getPaymentResponse();
  }

  getPaymentResponse() {
    this.isLoading = true;
    this.ordersService.getOrderResult(this.vnp_params).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.billData = data?.data;
        this.getUserProfile();
        this.getMotelData();
        this.code = data.code;
        if(this.code == "00") this.showSuccess(this.translateService.instant("payment.paySuccess"));
        else this.showError(this.translateService.instant("payment.payFail"));
      },
      error: (error) => {
        this.isLoading = false;
        if(error.error.message == "Not Found") this.showError(this.translateService.instant("payment.addNotFound"))
        else if(error.error.message == "Invalid data") this.showError(this.translateService.instant("payment.addInvalidData"))
      } 
    })
  }

  getUserProfile() {
    this.isLoading = true;
    this.userService.getUserProfile(this.billData.userId).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.userData = data.data;
      },
      error: (error) => {
        this.isLoading = false;
        if(error.error.message == "Not Found") this.showError(this.translateService.instant("user.notFoundAccount"))
      } 
    });
  }

  getMotelData() {
    this.productsService.getAProduct(this.billData.motelId).subscribe({
      next: (data) => {
        this.motelData = data.data;
      },
      error: (error) => {
        if(error.error.message == "Not Found") this.showError(this.translateService.instant("detail.nodata"))
      } 
    });
  }

  getFormValue(key: any) {
    switch(key) {
      case 'expiryDate':
        let date = new Date(this.billData[key]);
        return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
      case 'payDate':
        return this.getDisplayDate(this.billData[key]);
      case 'amount':
        return this.formatDisplayMoney(this.billData[key]);
      case 'status':
        if(this.billData[key] == 'paid') return this.translateService.instant("payment.paidStatus");
        else return this.translateService.instant("payment.unpaidStatus");
      default: return;
    }
  }

  getDisplayDate(date: string) {
    if(!date) return '';
    let year = Number(date.substring(0, 4));
    let month = Number(date.substring(4, 6));
    let day = date.substring(6, 8);
    return `${day}/${month}/${year}`;
  }

  formatDisplayMoney(amount: any) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

}
