import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  viewMode: any = true;

  abc: any = {};

  validateForm : UntypedFormGroup;

  constructor(
    private productsService: ProductsService,
    private nzMessageService: NzMessageService, 
    private modal: NzModalService, 
    private route: ActivatedRoute,
    private router: Router,
    private fb: UntypedFormBuilder
    ) {
      this.validateForm = this.fb.group({
        productCode: ['', [Validators.required, Validators.pattern(/^[0-9A-Z]+$/)]],
        productName: ['', [Validators.required]],
        price: [0, [Validators.required, Validators.min(0)]],
        categoryCode: ['', [Validators.required, Validators.pattern(/^[0-9A-Z]+$/)]]
      });
    }

  ngOnInit(): void {
    if(this.viewMode) {
      this.getProduct(this.route.snapshot.params["id"]);
    }
  }

  getProduct(id: string): void {
    this.productsService.getAProduct(id)
      .subscribe({
        next: (data) => {
          this.abc = data.data;
        },
        error: (error) => this.nzMessageService.error(error.error.message)
      });
  }

  goToEdit(): void {
    this.viewMode = false;
    this.validateForm.setValue({
      productCode: this.abc.productCode, 
      productName: this.abc.productName, 
      price: this.abc.price, 
      categoryCode: this.abc.categoryCode
    });
    this.validateForm.get('productCode')?.disable();    
  }

  confirmUpdate(event:any) : void {
    if(event.ctrlKey==true) {
      this.modal.confirm({
        nzTitle: 'Do you want to update this product?',
        nzOnOk: () => this.updateProduct()
      })
    } else {
      this.updateProduct();
    }
  }

  updateProduct() : void {
    let dataUpdate = this.validateForm.value;
    delete dataUpdate.productCode;
    this.productsService.updateProductById(this.abc._id, dataUpdate)
      .subscribe({
        next: (res) => {
          //console.log(res);
          this.nzMessageService.success('Update product successfully');
          this.router.navigate(['/products']);
        },
        error: (error) => this.nzMessageService.error(error.error.message)
      });
  }

  confirmDelete() : void {
    this.modal.confirm({
      nzTitle: 'Do you want to delete this product?',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'No',
      nzOnOk: () => this.deleteProduct()
    });
  }

  deleteProduct() : void {
    this.productsService.deleteProductById(this.abc._id)
      .subscribe({
        next: (res) => {
          //console.log(res);
          this.nzMessageService.success('Delete product successfully');
          this.router.navigate(['/products']);
        },
        error: (error) => this.nzMessageService.error(error.error.message)
      }); 
  }
}
