import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { AuthService } from "../../services/auth.service";
import { ProvinceService } from "../../services/province.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage'
import { finalize } from 'rxjs';
import { ProductsService } from 'src/app/services/products.service';
import { BaseComponent } from 'src/app/base/baseComponent';
import { NzCarouselComponent } from 'ng-zorro-antd/carousel';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent extends BaseComponent implements OnInit{

  isVisible = false;
  loading = false;
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

  @Output() onRegister: EventEmitter<any> = new EventEmitter();
  @ViewChild(NzCarouselComponent, { static: false }) myCarousel!: NzCarouselComponent;

  override ngOnInit(): void {
    super.ngOnInit();
    this.getUserProfile();
    this.getProvinceList();
  }

  constructor(private fb: NonNullableFormBuilder,
    private modal: NzModalService,
    private authService: AuthService,
    private provinceService: ProvinceService,
    private fireStorage: AngularFireStorage,
    private router: Router,
    private notification: NzNotificationService,
    private productsService: ProductsService) {
    super(notification, router, authService);
  }

  validateForm: FormGroup<{
    roomType: FormControl<string>;
    roomName: FormControl<string>;
    numberOfFloors: FormControl<number>;
    area: FormControl<number>;
    duration: FormControl<string>;
    price: FormControl<string>;
    currencyUnit: FormControl<string>;
    deposit: FormControl<string>;
    electricPrice: FormControl<string>;
    waterPrice: FormControl<string>;
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
    price: ['', [Validators.required]],
    currencyUnit: [''],
    deposit: ['', [Validators.required]],
    electricPrice: [''],
    waterPrice: [''],
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

  getUserProfile() {
    this.isLoading = true;
    this.authService.getUser().subscribe({
      next: (data) => {
        this.userData = data.data;
        this.isLoading = false;
        this.validateForm.get('currencyUnit')?.setValue("VND");
        this.validateForm.get('duration')?.setValue("1");
        this.validateForm.get('directions')?.setValue("north");
        this.validateForm.get('sameHouseWithOwner')?.setValue("1");
        this.validateForm.get('renterRequirement')?.setValue("4");
        this.validateForm.get('hasParkingArea')?.setValue("1");
        this.validateForm.get('roomType')?.setValue("room");
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.error.message);
      }
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

  getFormValue(key: string) {
    if(key == 'dateOfBirth' && this.validateForm.get(key)?.value) {
      let date = new Date(this.validateForm.get(key)?.value!);
      return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
    }
    return this.validateForm.get(key)?.value;
  }

  validateFormData() {
    for(let key of ['roomName', 'price', 'deposit', 'location', 'area']) {
      if(!this.validateForm.get(key)?.value) {
        this.showError("Please enter the required field.");
        return false;
      }
    }
    if(!this.address.length) {
      this.showError("Please enter the required field.");
      return false;
    }
    if(this.previews.length == 0) {
      this.showError("You must upload at least 1 image.");
      return false;
    }
    return true;
  }

  prepareLocationData() {
    let formData: any = this.validateForm.value;
    if(this.address) {
      let province = this.provinceList.find((province:any) => province.value == this.address[0]);
      let district = province.children?.length > 0 ? province.children.find((district:any) => district.value == this.address[1]) : null;
      let ward = district.children?.length > 0 ? district.children.find((ward:any) => ward.value == this.address[2]) : null;
      let location = "";
      location += `${ward ? ward.label + ', ' : ''}`;
      location += `${district ? district.label + ', ' : ''}`;
      location += `${province ? province.label : ''}`;
      formData['address'] = {
        value: this.address,
        text: location
      }
      this.validateForm.get('address')?.setValue(location);
    }
    
    return formData;
  }

  onBtnAdd() {
    if (this.validateFormData()) {
      this.onBtnSaveImage();
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
  }

  onBtnChangePassword() {
    this.isVisible = true;
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

  onBtnSaveImage() {
    for(let i = 0; i < this.previews.length; i++) {
      let filePath = `motels/${this.userData.email}_${this.selectedFiles[this.arrayIndex[i]].name}_${new Date().getTime()}`;
      const fileRef = this.fireStorage.ref(filePath);
      this.loading = true;
      this.fireStorage.upload(filePath, this.selectedFiles[this.arrayIndex[i]]).snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe({
            next: (url) => {
              let image = {
                iamgeUrl: url,
                filePath: filePath
              }
              this.imageData.push(image);
              if(i == this.previews.length - 1) this.postMotelData();
            },
            error: (err) => {
              this.loading = false;
              this.showError(err.error);
            }
          })
        })
      ).subscribe();
    }
  }

  postMotelData() {
    let formData = this.prepareLocationData();
    formData['images'] = this.imageData;
    formData['coordinate'] = this.latLng;
    console.log(formData)
    this.isLoading = true;
    // this.productsService.postAProduct(formData).subscribe({
    //   next: (data) => {
    //     this.isLoading = false;
    //     this.showSuccess("User profile updated successfully!");
    //   },
    //   error: (error) => {
    //     this.isLoading = false;
    //     this.showError(error.error.message);
    //   }
    // });
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

  onPlaceChange(event: any) {
    let mapData = event;
    this.latLng = mapData;
  }

  onChangeImageIndex(event: any) {
    this.currentIndex = event.to;
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

  onChangeValue(type: string, value: string) {
    if(type == "currencyUnit") this.selectedCurrencyUnits = value;
    else  {
      console.log(value)
      this.validateForm.get(type)?.setValue(value)
    }
  }

  newProduct() {
    
  }

  goList(): void {
    this.router.navigate(['/products']);
  }
  
}
