import { Component, OnInit, Output, EventEmitter, ViewChild, HostListener } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { UserService } from "../../services/user.service";
import { ProvinceService } from "../../services/province.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage'
import { finalize } from 'rxjs';
import { ProductsService } from 'src/app/services/products.service';
import { BaseComponent } from 'src/app/base/baseComponent';
import { NzCarouselComponent } from 'ng-zorro-antd/carousel';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent extends BaseComponent implements OnInit {
  viewMode: any = true;

  motelData: any = {};

  validateForm: FormGroup<{
    roomType: FormControl<string>;
    roomName: FormControl<string>;
    numberOfFloors: FormControl<number>;
    area: FormControl<number>;
    duration: FormControl<string>;
    price: FormControl<number>;
    currencyUnit: FormControl<string>;
    deposit: FormControl<number>;
    electricPrice: FormControl<number>;
    waterPrice: FormControl<number>;
    directions: FormControl<string>;
    sameHouseWithOwner: FormControl<string>;
    renterRequirement: FormControl<string>;
    hasParkingArea: FormControl<string>;
    numberOfWashingMachine: FormControl<number>;
    numberOfAirConditioners: FormControl<number>;
    numberOfWaterHeaters: FormControl<number>;
    numberOfWardrobes: FormControl<number>;
    numberOfBathrooms: FormControl<number>;
    numberOfBedrooms: FormControl<number>;
    numberOfBeds: FormControl<number>;
    note: FormControl<string>;
    location: FormControl<string>;
    address: FormControl<string>;
  }> = this.fb.group({
    roomType: ['', [Validators.required]],
    roomName: ['', [Validators.required]],
    numberOfFloors: [0],
    area: [0, [Validators.required]],
    duration: [''],
    price: [0, [Validators.required]],
    currencyUnit: [''],
    deposit: [0, [Validators.required]],
    electricPrice: [0],
    waterPrice: [0],
    directions: [''],
    sameHouseWithOwner: [''],
    renterRequirement: [''],
    hasParkingArea: [''],
    numberOfWashingMachine: [0],
    numberOfAirConditioners: [0],
    numberOfWaterHeaters: [0],
    numberOfWardrobes: [0],
    numberOfBathrooms: [0],
    numberOfBedrooms: [0],
    numberOfBeds: [0],
    note: [''],
    location: ['', [Validators.required]],
    address: ['', [Validators.required]],
  });

  showUserLarge = true;
  avatarUrl = '../../../assets/img/default-avatar.jpg';
  userData: any = {};
  provinceList: any = [];
  address = [];
  imageData: any = [];
  selectedFiles: any = [];
  previews: any = [];
  arrayIndex: any = [];
  currentIndex: number = 0;
  latLng = {
    lat: 21.0278,
    lng: 105.8342
  }
  selectedCurrencyUnits: string = 'VND';
  currencyUnits: string[] = ['VND', 'USD'];
  yesNoList = [
    { label: 'Có', value: '1' },
    { label: 'Không', value: '0' },
  ];
  roomTypeList = [
    { label: 'Chung cư mini', value: 'apartment' },
    { label: 'Nhà nguyên căn', value: 'house' },
    { label: 'Phòng trọ', value: 'room' }
  ];
  durationList = [
    { label: '1 tháng', value: '1' },
    { label: '3 tháng', value: '3' },
    { label: '6 tháng', value: '6' },
    { label: '12 tháng', value: '12' },
    { label: 'Trên 12 tháng', value: 'other' },
  ];
  directionList = [
    { label: 'Bắc', value: 'north' },
    { label: 'Đông', value: 'east' },
    { label: 'Đông Bắc', value: 'northeast' },
    { label: 'Đông Nam', value: 'southeast' },
    { label: 'Nam', value: 'south' },
    { label: 'Tây Nam', value: 'southwest' },
    { label: 'Tây Bắc', value: 'northwest' },
    { label: 'Tây', value: 'west' },
  ];
  renterRequirementList = [
    { label: 'Cho hộ gia đình thuê', value: '1' },
    { label: 'Cho nữ thuê', value: '2' },
    { label: 'Cho nam thuê', value: '3' },
    { label: 'Không', value: '4' }
  ];

  @ViewChild(NzCarouselComponent, { static: false }) myCarousel!: NzCarouselComponent;

  constructor(private fb: NonNullableFormBuilder,
    private modal: NzModalService,
    private userService: UserService,
    private provinceService: ProvinceService,
    private fireStorage: AngularFireStorage,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NzNotificationService,
    private productsService: ProductsService) {
    super(notification, router, userService);
  }

  override ngOnInit(): void {
    if(this.viewMode) {
      this.getProduct(this.route.snapshot.params["id"]);
      if(window.innerWidth <= 768) this.showUserLarge = false;
    }
  }

  getProduct(id: string): void {
    this.productsService.getAProduct(id)
      .subscribe({
        next: (data) => {
          this.motelData = data.data;
          this.motelData.images.forEach((item: any) => {
            this.previews.push(item.imageUrl);
          });
          this.getUser();
        },
        error: (error) => this.showError(error.error.message)
      });
  }

  getUser() {
    this.userService.getUserProfile(this.motelData.owner).subscribe({
      next: (data) => {
        this.userData = data.data;
        if(this.userData?.avatarInfo?.avatarUrl) this.avatarUrl = this.userData?.avatarInfo?.avatarUrl;
        else this.avatarUrl = '../../../assets/img/default-avatar.jpg';
      },
      error: (error) => this.showError(error.error.message)
    });
  }

  goToEdit(): void {
    this.viewMode = false;
    this.previews = [];
    // this.validateForm.setValue({
    //   productCode: this.abc.productCode, 
    //   productName: this.abc.productName, 
    //   price: this.abc.price, 
    //   categoryCode: this.abc.categoryCode
    // });
    // this.validateForm.get('productCode')?.disable();    
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
    //delete dataUpdate.productCode;
    this.productsService.updateProductById(this.motelData._id, dataUpdate)
      .subscribe({
        next: (res) => {
          //console.log(res);
          this.showSuccess('Update product successfully');
          this.router.navigate(['/products']);
        },
        error: (error) => this.showError(error.error.message)
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
    this.productsService.deleteProductById(this.motelData._id)
      .subscribe({
        next: (res) => {
          //console.log(res);
          this.showSuccess('Delete product successfully');
          this.router.navigate(['/products']);
        },
        error: (error) => this.showError(error.error.message)
      }); 
  }

  getProvinceList() {
    this.isLoading = true;
    this.provinceService.getAllProvince([{}]).subscribe({
      next: (data) => {
        this.provinceList = data.data;
        this.processProvinceList();
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.error.message);
      }
    });
  }

  processProvinceList() {
    let list: any[] = [];
    this.provinceList.forEach((province: any) => {
      let provinceObj;
      if(!province.districts?.length) {
        provinceObj = {
          value: province.province_code,
          label: province.province_name,
          isLeaf: true
        };
      } else {
        let districtArr: any[] = [];
        province.districts.forEach((district: any) => {
          let districtObj;
          if(!district.wards?.length) {
            districtObj = {
              value: district.district_code,
              label: district.district_name,
              isLeaf: true
            };
          } else {
            let wardArr: any[] = [];
            district.wards.forEach((ward: any) => {
              let wardObj = {
                value: ward.ward_code,
                label: ward.ward_name,
                isLeaf: true
              };
              wardArr.push(wardObj);
            })
            districtObj = {
              value: district.district_code,
              label: district.district_name,
              children: wardArr
            };
          }
          districtArr.push(districtObj);
        })
        provinceObj = {
          value: province.province_code,
          label: province.province_name,
          children: districtArr
        };
      }
      list.push(provinceObj);
    })
    this.provinceList = list;
  }

  onChangeValue(type: string, value: string) {
    if(type == "currencyUnit") this.selectedCurrencyUnits = value;
    else  {
      this.validateForm.get(type)?.setValue(value)
    }
  }

  onPlaceChange(event: any) {
    let mapData = event;
    this.latLng = mapData;
  }

  deleteOneImage() {
    this.previews.splice(this.currentIndex, 1);
    this.arrayIndex.splice(this.currentIndex, 1);
  }

  deleteAllImages() {
    this.previews = [];
    this.selectedFiles = [];
    this.arrayIndex = [];
  }

  nextImage() {
    if(this.currentIndex + 1 == this.previews.length) this.currentIndex = 0;
    else this.currentIndex++;
    this.myCarousel.goTo(Number(this.currentIndex));
  }

  prevImage() {
    if(this.currentIndex == 0) this.currentIndex = this.previews.length - 1;
    else this.currentIndex--;
    this.myCarousel.goTo(Number(this.currentIndex));
  }

  onChangeImage(event: any) {
    this.selectedFiles = event.target.files;

    this.previews = [];
    this.arrayIndex = [];
    if (this.selectedFiles && this.selectedFiles[0]) {
      const numberOfFiles = this.selectedFiles.length;
      for (let i = 0; i < numberOfFiles; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previews.push(e.target.result);
        };
        this.arrayIndex.push(i)
        reader.readAsDataURL(this.selectedFiles[i]);
      }
      
    } else {
      this.previews = [];
      this.selectedFiles = [];
    }
  }

  onChangeImageIndex(event: any) {
    this.currentIndex = event.to;
  }

  getLabelFromList(type: string, value: any) {
    switch (type) {
      case "roomType":
        return this.roomTypeList.find(item => item.value === value)?.label;
      default:
        return '';
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if(window.innerWidth <= 768) this.showUserLarge = false;
    else this.showUserLarge = true;
  }
}
