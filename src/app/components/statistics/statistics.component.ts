import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/services/products.service';
import { Category } from 'src/app/models/category.model';
// import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  mode = 'date';
  code = 'C1';
  categories?: Category[];
  date: Date = new Date();
  countByTime: number = 0;
  countByCategory: number | undefined = 0;
  
  constructor(
    private productsService: ProductsService,
    ) {}

  ngOnInit(): void {
    this.onSelectDateChange(this.mode);
    this.onSelectCategoryChange(this.code);
    this.loadCategoryFromServer();
  }

  onSelectDateChange(event : any): void {
    this.mode = event;
    this.onOpenChange(false);
  } 

  onOpenChange(event: boolean) : void {
    if(!event) {
      this.productsService.getProductStatistics(this.date, this.mode, this.code).subscribe({
        next: (data) => {
          //console.log(data);
          this.countByTime = data.countProductByTime;
          this.countByCategory = data.countProductByCategory;
        },
        error: (error) => {}
      });
    }
  }

  onSelectCategoryChange(event : any): void {
    this.code = event;
    this.onOpenChange(false);
  }

  loadCategoryFromServer(): void {
    let filter = [{}];
    // this.categoryService.getAllCategory(filter).subscribe({
    //   next: (data) => {
    //     this.categories = data.data;
    //   },
    //   error: (err) => {}
    // });
  }

}
