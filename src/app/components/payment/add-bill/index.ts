import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { UserService } from "../../../services/user.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/base/baseComponent';
import { TranslateService } from '@ngx-translate/core';
import { ProductsService } from 'src/app/services/products.service';
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

  @Output() onAddBill: EventEmitter<any> = new EventEmitter();
  @Output() onAddBillFail: EventEmitter<any> = new EventEmitter();

  validateForm: FormGroup<{
    description: FormControl<string>;
  }> = this.fb.group({
    description: ['', [Validators.required, Validators.maxLength(100)]]
  });

  constructor(private fb: NonNullableFormBuilder,
    private productsService: ProductsService,
    private userService: UserService,
    private translateService: TranslateService,
    private router: Router,
    private notification: NzNotificationService,
    private modal: NzModalService) {
    super(notification, router, userService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.getUser();
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

  submitForm(): void {
    if (this.validateFormData()) {
      
    } else {
      
    }
  }

  validateFormData() {
    
    return true;
  }

}
