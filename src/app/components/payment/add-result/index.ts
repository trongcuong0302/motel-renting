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
    this.ordersService.getOrderResult(this.vnp_params).subscribe({
      next: (data) => {
        this.isLoading = false;
        console.log(data);
        this.showSuccess(this.translateService.instant("payment.addSuccess"));
      },
      error: (error) => {
        this.isLoading = false;
        console.log(error);
      } 
    })
  }

}
