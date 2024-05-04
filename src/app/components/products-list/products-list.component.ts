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


@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent extends BaseComponent implements OnInit {
  products: any = [];
  currentProduct: Product = {};
  pageSize = 12;
  pageIndex = 1;
  total = 1;
  visibleProductName = false;
  visibleCategoryCode = false;
  searchName = '';
  searchCode = '';
  price = 100;
  sortField: string | null = '';
  sortOrder: string | null = '';
  filterPrice = [
    { text: '<13', value: 13 },
    { text: '<12', value: 12 },
    { text: '<11', value: 11 }
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
  moteList = [1,2,3,4,5,6,7,8,9,10]
  
  constructor(
    private productsService: ProductsService,
    private nzMessageService: NzMessageService,
    private userService: UserService,
    private router: Router,
    private notification: NzNotificationService) { 
      super(notification, router, userService);
    }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadDataFromServer(this.pageIndex, this.pageSize, this.searchName, this.searchCode, null, null, [{key: 'price', value: this.price}]);
  }

  loadDataFromServer(pageIndex: number, pageSize: number, searchName: string, searchCode: string, sortField: string | null, sortOrder: string | null, filters: Array<{ key: string; value: number }>): void {
    this.isLoading = true;
    let filter = [
      {field: "pageIndex", value: pageIndex, operator: "pagination"},
      {field: "pageSize", value: pageSize, operator: "pagination"},
      {field: "productName", value: searchName, operator: "includes"},
      {field: "categoryCode", value: searchCode, operator: "includes"},
      {field: sortField, value: sortOrder, operator: "sort"},
    ];
    
    filters.forEach(item => {
      filter.push({field: item.key, value: item.value, operator: "less"});
    });
    this.productsService.getAllProduct(filter).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.total = data.total;
        this.products = data.data;
      },
      error: (err) => {
        this.isLoading = false;
        this.nzMessageService.error(err.error.message)
      } 
    })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const {pageIndex, pageSize, sort, filter} = params;
    const searchName = this.searchName;
    const searchCode = this.searchCode;
    const currentSort = sort.find(item => item.value !== null);
    this.sortField = (currentSort && currentSort.key) || null;
    this.sortOrder = (currentSort && currentSort.value) || null;
    this.price = filter[0].value;
    this.loadDataFromServer(pageIndex, pageSize, searchName, searchCode, this.sortField, this.sortOrder, filter);
  }

  search() :void {
    this.visibleProductName = false;
    this.visibleCategoryCode = false;
    this.loadDataFromServer(this.pageIndex, this.pageSize, this.searchName, this.searchCode, this.sortField, this.sortOrder, [{key: 'price', value: this.price}]);
  }

  resetName() :void {
    this.searchName = '';
    this.search();
  }

  resetCode() :void {
    this.searchCode = '';
    this.search();
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
        if(!item?.listComments || !item?.listComments.length) return `5/5`;
        let score = 0;
        item.listComments.forEach((item: any) => {
          score += item.rate;
        })
        score = Math.round(score / item.listComments.length * 2) / 2;
        return `${score}/5`;
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
    this.search();
  }
}
