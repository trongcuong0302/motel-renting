import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { UserService } from "../../../services/user.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/base/baseComponent';
import { TranslateService } from '@ngx-translate/core';
import { ProductsService } from 'src/app/services/products.service';
import { OrdersService } from 'src/app/services/orders.service';
import { differenceInCalendarDays } from 'date-fns';

@Component({
  selector: '[add-bill]',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class AddBill extends BaseComponent implements OnInit {
  public expiredDate: Date = new Date();
  today = new Date();
  products: any = [];
  accountData: any = {};
  motelName: string = '';
  motelNameList: any = [];
  paymentName: string = '';
  amount: number = 0;
  paymentList: any = [];
  isEdit: boolean = false;
  currentIndex: number = -1;

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

  disabledDate = (current: Date): boolean =>
    // Can not select days before today
    differenceInCalendarDays(current, this.today) < 0;

  @Input() formBill: any;
  @Input() isEditBill: boolean = false;
  @Output() onAddBill: EventEmitter<any> = new EventEmitter();
  @Output() onAddBillFail: EventEmitter<any> = new EventEmitter();

  validateForm: FormGroup<{
    description: FormControl<string>;
    content: FormControl<string>;
  }> = this.fb.group({
    description: ['', [Validators.required, Validators.maxLength(100)]],
    content: ['', [Validators.required]]
  });

  constructor(private fb: NonNullableFormBuilder,
    private productsService: ProductsService,
    private userService: UserService,
    private ordersService: OrdersService,
    private translateService: TranslateService,
    private router: Router,
    private notification: NzNotificationService,
    private modal: NzModalService) {
    super(notification, router, userService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.getUser();
    if(this.formBill && this.isEditBill) {
      this.bindFormBill();
    }
  }

  getUser() {
    this.isLoading = true;
    this.userService.getUser().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.accountData = data.data;
        this.filterMotel();
      },
      error: (error) => {
        this.isLoading = false;
        if(error.error.message == "Unauthenticated") this.showError(this.translateService.instant("user.unauthenticated"))
        else if(error.error.message == "Not Found") this.showError(this.translateService.instant("user.notFoundAccount"))
      }
    });
  }

  bindFormBill() {
    this.motelName = this.formBill.motelId;
    this.expiredDate = new Date(this.formBill.expiryDate);
    this.paymentList = this.formBill.paymentList;
    this.validateForm.get('description')?.setValue(this.formBill.description);
    this.validateForm.get('content')?.setValue(this.formBill.content);
  }

  filterMotel() {
    this.isLoading = true;
    let filter = [
      {field: 'ownerId', value: this.accountData?._id, operator: "matches"}
    ];
    this.productsService.getAllProduct(filter).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.products = data.data;
        this.getMotelNameList();
      },
      error: (err) => {
        this.isLoading = false;
        if(err.error.message == "Can not find any items in the database") this.showError(this.translateService.instant("list.foundNoItem"))
      } 
    })
  }

  getMotelNameList() {
    this.motelNameList = [];
    for(let item of this.products) {
      let label = `${item.roomName} - ${item.address}`;
      this.motelNameList.push({label: label, value: item._id});
    }
  }

  saveBill() {
    let formData = {
      _id: this.formBill._id,
      motelId: this.motelName,
      userId: this.accountData._id,
      expiryDate: new Date(new Date(this.expiredDate).setHours(23, 59, 59, 999)),
      amount: this.getTotalAmount(),
      paymentList: this.paymentList,
      description: this.validateForm.get('description')?.value,
      content: this.validateForm.get('content')?.value,
      isEdit: this.isEditBill
    }
    this.isLoading = true;
    this.ordersService.createAnOrder(formData).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.showSuccess(this.translateService.instant("payment.addSuccess"));
        this.onAddBill.emit();
      },
      error: (error) => {
        this.isLoading = false;
        if(error.error.message == "Not Found") this.showError(this.translateService.instant("payment.addNotFound"))
        else if(error.error.message == "Invalid data") this.showError(this.translateService.instant("payment.addInvalidData"))
        this.onAddBillFail.emit();
      } 
    });
  }

  submitForm(): void {
    if (this.validateFormData()) {
      this.confirmTotalZero();
    } else {
      this.onAddBillFail.emit();
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  validateFormData() {
    if(!this.motelName) {
      this.showError(this.translateService.instant("payment.motelNameError"));
      return false;
    }

    if(!this.validateForm.get('description')?.value) {
      this.showError(this.translateService.instant("payment.descriptionError"));
      return false;
    }

    if(!this.validateForm.get('content')?.value) {
      this.showError(this.translateService.instant("payment.contentError"));
      return false;
    }
    return true;
  }

  confirmTotalZero() {
    this.addPayment();
    if(this.getTotalAmount() == 0) {
      this.modal.confirm({
        nzTitle: this.translateService.instant("payment.totalWarning"),
        nzOkText: this.translateService.instant("add.yes"),
        nzOkType: 'primary',
        nzCancelText: this.translateService.instant("add.no"),
        nzOnOk: () => this.saveBill(),
        nzOnCancel: () => this.onAddBillFail.emit()
      });
    } else {
      this.saveBill();
    }
  }

  addPayment() {
    if(!this.paymentName) return;
    let payment = {
      name: '',
      amount: 0
    }
    payment.name = this.paymentName;
    payment.amount = this.amount;
    if(this.isEdit) {
      this.paymentList[this.currentIndex] = payment;
      this.currentIndex = -1;
      this.isEdit = false;
    }
    else this.paymentList.push(payment);

    this.paymentName = '';
    this.amount = 0;
  }

  getPaymentLabel(payment: any) {
    return `${payment.name}: ${this.formatDisplayMoney(payment.amount)}`
  }

  getTotalAmountLabel() {
    return this.formatDisplayMoney(this.getTotalAmount());
  }

  getTotalAmount(): number {
    let total = 0;
    this.paymentList.forEach((payment: any) => {
      total += payment.amount;
    })
    return total;
  }

  editPayment(i: number) {
    this.isEdit = true;
    this.currentIndex = i;
    this.paymentName = this.paymentList[i].name;
    this.amount = this.paymentList[i].amount;
  }

  deletePayment(i: number) {
    if(this.currentIndex == i) {
      this.paymentName = '';
      this.amount = 0;
      this.isEdit = false;
    }
    if(this.currentIndex > i) this.currentIndex--;

    this.paymentList.splice(i, 1);
  }

  confirmDelete(i: number) : void {
    if(this.isLoading) return;
    this.modal.confirm({
      nzTitle: this.translateService.instant("payment.deleteWarning"),
      nzOkText: this.translateService.instant("add.yes"),
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: this.translateService.instant("add.no"),
      nzOnOk: () => this.deletePayment(i)
    });
  }

  formatDisplayMoney(amount: any) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  onChange(event: any) {
    console.log(event)
  }

}
