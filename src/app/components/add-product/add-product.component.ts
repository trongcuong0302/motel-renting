import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/product.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit{

  product: Product = {
    productCode: '',
    productName: '',
    price: 0,
    categoryCode: ''
  };
  validateForm: UntypedFormGroup;
  submitted = false;

  constructor(
    private productsService: ProductsService,
    private router: Router,
    private message : NzMessageService,
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
  }

  saveProduct(): void {
    const data = {
      productCode: this.validateForm.value.productCode,
      productName: this.validateForm.value.productName,
      price: this.validateForm.value.price,
      categoryCode: this.validateForm.value.categoryCode
    }

    this.productsService.postAProduct(data)
      .subscribe({
        next: (res) => {
          //console.log(res);
          this.submitted = true;
        },
        error: (err) => this.message.error(err.error.message)
        
      });
  }

  newProduct(): void {
    this.submitted = false;
    this.product = {
      productCode: '',
      productName: '',
      price: 0,
      categoryCode: ''
    };
  }

  goList(): void {
    this.router.navigate(['/products']);
  }
  
}
