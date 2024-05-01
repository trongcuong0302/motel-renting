import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { UserService } from "../../services/user.service";
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
  isEdit: boolean = true;
  isVisible = false;
  loading = false;
  newRoom: any = {};
  userData: any = {};
  provinceList: any = [];
  location = [];
  imageData: any = [];
  listImageFiles: any = [];
  selectedFiles: any = [];
  previews: any = [];
  currentIndex: number = 0;
  renterList: any = [];
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
    private userService: UserService,
    private provinceService: ProvinceService,
    private fireStorage: AngularFireStorage,
    private router: Router,
    private notification: NzNotificationService,
    private productsService: ProductsService) {
    super(notification, router, userService);
  }

  validateForm: FormGroup<{
    roomType: FormControl<string>;
    roomStatus: FormControl<string>;
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
    roomStatus: ['', [Validators.required]],
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

  getUserProfile() {
    this.isLoading = true;
    this.userService.getUser().subscribe({
      next: (data) => {
        this.userData = data?.data;
        this.isLoading = false;
        this.validateForm.get('currencyUnit')?.setValue("VND");
        this.validateForm.get('duration')?.setValue("1");
        this.validateForm.get('directions')?.setValue("north");
        this.validateForm.get('sameHouseWithOwner')?.setValue("1");
        this.validateForm.get('renterRequirement')?.setValue("4");
        this.validateForm.get('hasParkingArea')?.setValue("1");
        this.validateForm.get('roomType')?.setValue("room");
        this.validateForm.get('roomStatus')?.setValue("available");
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
    for(let key of ['roomName', 'price', 'deposit', 'address', 'area']) {
      if(!this.validateForm.get(key)?.value) {
        this.showError("Please enter the required field.");
        return false;
      }
    }
    for(let key of ['area', 'price', 'deposit', 'electricPrice', 'waterPrice', 'numberOfWashingMachine', 'numberOfAirConditioners',
    'numberOfWaterHeaters', 'numberOfWardrobes', 'numberOfBathrooms', 'numberOfBedrooms', 'numberOfBeds', 'numberOfFloors']) {
      if(this.validateForm.get(key)?.value! < 0) {
        this.showError("Number fields must not be negative.");
        return false;
      }
    }
    if(!this.location.length) {
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
    if(this.location) {
      let province = this.provinceList.find((province:any) => province.value == this.location[0]);
      let district = province.children?.length > 0 ? province.children.find((district:any) => district.value == this.location[1]) : null;
      let ward = district.children?.length > 0 ? district.children.find((ward:any) => ward.value == this.location[2]) : null;
      let location = "";
      location += `${ward ? ward.label + ', ' : ''}`;
      location += `${district ? district.label + ', ' : ''}`;
      location += `${province ? province.label : ''}`;
      formData['location'] = {
        value: this.location,
        text: location
      }
      this.validateForm.get('location')?.setValue(location);
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

    // this.previews = [];
    // this.arrayIndex = [];
    if (this.selectedFiles && this.selectedFiles[0]) {
      const numberOfFiles = this.selectedFiles.length;
      for (let i = 0; i < numberOfFiles; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previews.push(e.target.result);
        };
        reader.readAsDataURL(this.selectedFiles[i]);
      }
      this.listImageFiles = [ ...this.listImageFiles, ...this.selectedFiles];
      this.currentIndex = 0;
    } else {
      //this.previews = [];
      this.selectedFiles = [];
    }
  }

  async onBtnSaveImage() {
    for(let i = 0; i < this.previews.length; i++) {
      let roomName = this.validateForm.get("roomName")?.value;
      let filePath = `motels/${this.userData.email}_${roomName}_${this.listImageFiles[i].name}_${new Date().getTime()}`;
      const fileRef = this.fireStorage.ref(filePath);
      this.isLoading = true;
      const uploadTask = await this.fireStorage.upload(filePath, this.listImageFiles[i]);
      const url = await uploadTask.ref.getDownloadURL();
      let image = {
        imageUrl: url,
        filePath: filePath
      }
      this.imageData.push(image);
      if(i == this.previews.length - 1) this.postMotelData();
    }
  }

  postMotelData() {
    let formData = this.prepareLocationData();
    formData['images'] = this.imageData;
    formData['coordinate'] = this.latLng;
    formData['owner'] = this.userData?._id;
    formData['renters'] = this.renterList;
    this.isLoading = true;
    this.productsService.postAProduct(formData).subscribe({
      next: (data) => {
        this.newRoom = data.data;
        this.isLoading = false;
        this.showSuccess("Motel upload successfully!");
        this.isEdit = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.error.message);
      }
    });
  }

  deleteOneImage() {
    this.previews.splice(this.currentIndex, 1);
    this.listImageFiles.splice(this.currentIndex, 1);
    this.currentIndex = 0;
  }

  deleteAllImages() {
    this.previews = [];
    this.selectedFiles = [];
    this.listImageFiles = [];
    this.currentIndex = 0;
  }

  confirmDeleteImage(type: any) : void {
    let title = type == 'all' ? 'Do you want to delete all images?' : 'Do you want to delete this image?';
    this.modal.confirm({
      nzTitle: title,
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'No',
      nzOnOk: () => type == 'all' ? this.deleteAllImages() : this.deleteOneImage()
    });
  }

  onPlaceChange(event: any) {
    let mapData = event;
    this.latLng = mapData;
  }

  onChangeImageIndex(event: any) {
    this.currentIndex = event.to;
  }

  nextImage() {
    if(this.currentIndex + 1 >= this.previews.length) this.currentIndex = 0;
    else this.currentIndex++;
    this.myCarousel.goTo(Number(this.currentIndex));
  }

  prevImage() {
    if(this.currentIndex <= 0) this.currentIndex = this.previews.length - 1;
    else this.currentIndex--;
    this.myCarousel.goTo(Number(this.currentIndex));
  }

  onChangeValue(type: string, value: string) {
    if(type == "currencyUnit") this.selectedCurrencyUnits = value;
    else  {
      this.validateForm.get(type)?.setValue(value)
    }
  }

  newProduct() {
    location.reload();
  }

  goList(): void {
     window.open("http://localhost:4200/products/" + this.newRoom._id);
  }
  
  onRenterListChanged(renterList: any) {
    this.renterList = renterList;
  }
}
