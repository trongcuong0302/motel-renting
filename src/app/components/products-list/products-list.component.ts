import { Component, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/product.model';
import { ProductsService } from 'src/app/services/products.service';
import { NzTableSortFn } from 'ng-zorro-antd/table';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { UserService } from "src/app/services/user.service";
import { BaseComponent } from 'src/app/base/baseComponent';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';


@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent extends BaseComponent implements OnInit {
  products: any = [];
  accountData: any = {};
  currentProduct: any = {};
  pageSize = 12;
  pageIndex = 1;
  total = 1;
  visibleProductName = false;
  visibleCategoryCode = false;
  searchName = '';
  searchCode = '';
  price = 100;
  sortField: string | null = '';
  filters: any = [];
  filterData: any = {};
  sortOrder: string = 'ascend';
  sortList = [
    { label: 'Giá tăng dần', value: 'ascend' },
    { label: 'Giá giảm dần', value: 'descend' },
  ];

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

  avatarUrl: string = '../../../assets/img/default-avatar.jpg';
  
  constructor(
    private productsService: ProductsService,
    private nzMessageService: NzMessageService,
    private userService: UserService,
    private translateService: TranslateService,
    private router: Router,
    private notification: NzNotificationService) { 
      super(notification, router, userService);
    }

  override ngOnInit(): void {
    super.ngOnInit();
    this.filterData = { search: "", price: [0, 0] };
    this.getUser();
    this.onSearchEvent(this.filterData);
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

  getMotelData(key: any, item: any) {
    let findItem: any = null;
    switch (key) {
      case "name":
        return `${item?.roomName} - ${item?.address}`;
      case "location":
        return `${item?.location?.text}`;
      case "price":
        return `${item?.price} ${item?.currencyUnit}`;
      case "roomType":
        findItem = this.roomTypeList.find(d => d.value === item[key]);
        return findItem?.label;
      case "roomStatus":
        findItem = this.roomStatusList.find(d => d.value === item[key]);
        return findItem?.label;
      case "image": 
        return item?.images[0]?.imageUrl;
      case "rate":
        return `${item?.rate}/5`;
      default:
        return '';
    }
  }

  getTagColor(item: any) {
    switch(item?.roomStatus) {
      case 'available': return 'processing';
      case 'combined': return 'warning';
      case 'rented': return 'success';
      case 'closed': return 'error';
      default: return 'default';
    }
  }

  setActiveProduct(product: any): void {
    this.currentProduct = product;
    this.router.navigate([`/products/${this.currentProduct._id}`]);
  }

  onChangePageIndex() {
    this.onSearchEvent(this.filterData, this.pageIndex);
  }

  onSearchEvent(data: any, pageIndex: any = null) {
    this.pageIndex = pageIndex ? pageIndex : 1;
    this.filterData = data;
    let filter = [
      {field: "pageIndex", value: this.pageIndex, operator: "pagination"},
      {field: "pageSize", value: this.pageSize, operator: "pagination"},
      {field: "search", value: data.search, operator: "includes"},
      {field: "price", value: this.sortOrder, operator: "sort"},
    ];
    for(let key of ["roomType", "roomStatus", "sameHouseWithOwner", "renterRequirement", "hasParkingArea", "directions", "location"]) {
      if(data[key]) {
        filter.push({field: key, value: data[key], operator: "matches"});
      }
    }

    for(let key of ["rate", "numberOfAirConditioners", "numberOfWaterHeaters", "numberOfBathrooms", "numberOfBedrooms"]) {
      if(data[key]) {
        filter.push({field: key, value: Number(data[key]), operator: "more"});
      }
    }

    if(data?.area) {
      let range: any = [];
      switch (data.area) {
        case "0":
          range = [0, 20];
          break;
        case "1": 
          range = [20, 30];
          break;
        case "2": 
          range = [30, 50];
          break;
        case "3": 
          range = [50, 70];
          break;
        case "4": 
          range = [70, 90];
          break;
        case "5": 
          range = [90, 100000];
          break;
        default:
          break;
      }
      filter.push({field: 'area', value: range, operator: "range"});
    }

    if(data?.price[1] == data.price[0]) {
      let priceValue = data.price[0] * 1000000;
      if(data.price[0] == 15) {
        filter.push({field: 'price', value: priceValue, operator: "more"});
      }
      if(data.price[0] != 0 && data.price[0] != 15) {
        filter.push({field: 'price', value: priceValue, operator: "matches"});
      }
    } else {
      let start, end;
      if(data?.price[1] == 15) {
        end = 10**100;
      }
      start = data?.price[0] * 1000000;
      end = data?.price[1] * 1000000;
      filter.push({field: 'price', value: [start, end], operator: "range"});
    }
    
    if(data?.isMyMotel) {
      filter.push({field: 'owner', value: this.accountData?._id, operator: "matches"});
    }
    this.filterMotel(filter);
  }

  filterMotel(filter: any) {
    this.isLoading = true;
    this.filters = filter;
    this.productsService.getAllProduct(filter).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.total = data.total;
        this.products = data.data;
      },
      error: (err) => {
        this.isLoading = false;
        if(err.error.message == "Can not find any items in the database") this.showError(this.translateService.instant("list.foundNoItem"))
      } 
    })
  }

  onChangeSortOrder() {
    let sortFilter = this.filters.find((item:any) => item.operator == "sort");
    sortFilter.value = this.sortOrder;
    this.filterMotel(this.filters);
  }

  addMotel() {
    this.router.navigate(['/add']);
  }
}
