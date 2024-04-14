import { Component, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/product.model';
import { ProductsService } from 'src/app/services/products.service';
import { NzTableSortFn } from 'ng-zorro-antd/table';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from "src/app/services/auth.service";
import { BaseComponent } from 'src/app/base/baseComponent';


@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.css']
})
export class ProductsListComponent extends BaseComponent implements OnInit {
  products?: Product[];
  currentProduct: Product = {};
  pageSize = 10;
  pageIndex = 1;
  total = 1;
  loading = true;
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
  
  constructor(
    private productsService: ProductsService,
    private nzMessageService: NzMessageService,
    private authService: AuthService,
    private router: Router,
    private notification: NzNotificationService) { 
      super(notification, router, authService);
    }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadDataFromServer(this.pageIndex, this.pageSize, this.searchName, this.searchCode, null, null, [{key: 'price', value: this.price}]);
  }

  setActiveProduct(product: Product): void {
    this.currentProduct = product;
    this.router.navigate([`/products/${this.currentProduct._id}`]);
  }

  loadDataFromServer(pageIndex: number, pageSize: number, searchName: string, searchCode: string, sortField: string | null, sortOrder: string | null, filters: Array<{ key: string; value: number }>): void {
    this.loading = true;
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
        this.loading = false;
        this.total = data.total;
        this.products = data.data;
        
      },
      error: (err) => this.nzMessageService.error(err.error.message)
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

}
