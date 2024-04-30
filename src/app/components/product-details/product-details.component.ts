import { Component, OnInit, Output, EventEmitter, ViewChild, HostListener } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { UserService } from "../../services/user.service";
import { ProvinceService } from "../../services/province.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
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
  showSettingButton = false;
  avatarUrl = '../../../assets/img/default-avatar.jpg';
  userData: any = {};
  provinceList: any = [];
  location = [];
  imageData: any = [];
  selectedFiles: any = [];
  previews: any = [];
  listImageFiles: any = [];
  oldImages: any = [];
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
    private message: NzMessageService,
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
      this.getProvinceList();
      this.getProduct(this.route.snapshot.params["id"]);
      if(window.innerWidth <= 768) this.showUserLarge = false;
      if(window.innerWidth <= 550) this.showSettingButton = true;
    }
  }

  getProduct(id: string): void {
    this.productsService.getAProduct(id)
      .subscribe({
        next: (data) => {
          this.motelData = data.data;
          console.log(this.motelData)
          this.clearData();
          this.bindDataToForm();
          this.getUser();
        },
        error: (error) => this.showError(error.error.message)
      });
  }

  clearData() {
    this.location = [];
    this.imageData = [];
    this.selectedFiles = [];
    this.previews = [];
    this.listImageFiles = [];
    this.oldImages = [];
    this.currentIndex = 0;
  }

  bindDataToForm() {
    for (const key in this.motelData) {
      this.validateForm.get(key)?.setValue(this.motelData[key]);
      if(key == "currencyUnit") this.selectedCurrencyUnits = this.motelData[key];
      if(key == "location") this.location = this.motelData[key]?.value;
      if(key == "images" && this.motelData[key]?.length) {
        this.motelData.images.forEach((item: any) => {
          this.previews.push(item.imageUrl);
          this.listImageFiles.push(item.imageUrl);
          this.oldImages.push(item.imageUrl);
        });
      }
      if(key == "coordinate" && this.motelData[key]) this.latLng = this.motelData.coordinate;
    }
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

  getUserData(key: string) {
    switch (key) {
      case 'dateOfBirth':
        if(!this.userData[key]) return '';
        let date = new Date(this.userData[key]);
        return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
      case 'hometown':
      case 'address':
        return this.userData[key]?.text ?? '';
      case 'job':
      case 'linkFacebook':
        return this.userData[key] ?? '';
      default: 
        return '';
    }
  }

  getUserDataLabel(key: string) {
    switch (key) {
      case 'dateOfBirth':
        return 'Date of Birth';
      case 'hometown':
        return 'Hometown';
      case 'address':
        return 'Address';
      case 'job':
        return 'Job';
      case 'linkFacebook':
        return 'Link Facebook';
      default: 
        return '';
    }
  }

  goToEdit(): void {
    if(this.isLoading) return;
    this.viewMode = false;
    this.currentIndex = 0;
    // this.validateForm.setValue({
    //   productCode: this.abc.productCode, 
    //   productName: this.abc.productName, 
    //   price: this.abc.price, 
    //   categoryCode: this.abc.categoryCode
    // });
    // this.validateForm.get('productCode')?.disable();    
  }

  cancelEdit() {
    if(this.isLoading) return;
    this.viewMode = true;
    this.getProduct(this.route.snapshot.params["id"]);
  }

  confirmUpdate(event:any) : void {
    if(this.isLoading) return;
    if(event.ctrlKey==true) {
      this.modal.confirm({
        nzTitle: 'Do you want to update this product?',
        nzOnOk: () => this.updateProduct()
      })
    } else {
      this.updateProduct();
    }
  }

  validateFormData() {
    for(let key of ['roomName', 'price', 'deposit', 'location', 'area']) {
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

  updateMotelData() {
    let formData = this.prepareLocationData();
    formData['images'] = [ ...this.motelData.images,  ...this.imageData];
    formData['coordinate'] = this.latLng;
    this.isLoading = true;
    this.productsService.updateProductById(this.motelData._id, formData).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.showSuccess("Motel updated successfully!");
        this.getProduct(this.route.snapshot.params["id"]);
        this.viewMode = true;
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.error.message);
      }
    });
  }

  updateProduct() : void {
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

  confirmDelete() : void {
    if(this.isLoading) return;
    this.modal.confirm({
      nzTitle: 'Do you want to delete this motel?',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'No',
      nzOnOk: () => this.deleteProduct()
    });
  }

  deleteProduct() : void {
    let imageArr = this.motelData?.images ?? [];
    imageArr.forEach((image: any) => {
      this.deleteOldImage(image.filePath)
    })
    this.isLoading = true;
    this.productsService.deleteProductById(this.motelData._id)
      .subscribe({
        next: (res) => {
          //console.log(res);
          this.isLoading = false;
          this.showSuccess('Delete motel successfully');
          this.router.navigate(['/products']);
        },
        error: (error) => {
          this.isLoading = false;
          this.showError(error.error.message)
        } 
      }); 
  }

  getProvinceList() {
    this.isLoading = true;
    this.provinceService.getAllProvince([{}]).subscribe({
      next: (data) => {
        this.isLoading = false;
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
    this.listImageFiles.splice(this.currentIndex, 1);
    this.currentIndex = 0;
  }

  deleteAllImages() {
    this.previews = [];
    this.selectedFiles = [];
    this.listImageFiles = [];
    this.currentIndex = 0;
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

  onChangeImage(event: any) {
    this.selectedFiles = event.target.files;

    //this.previews = [];
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
    this.getListImageUpload();
    if(this.listImageFiles.length == 0) {
      this.updateMotelData();
      return;
    }
    for(let i = 0; i < this.listImageFiles.length; i++) {
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
      if(i == this.listImageFiles.length - 1) this.updateMotelData();
        
    }
  }

  getListImageUpload() {
    this.oldImages.forEach((item: any) => {
      let find = this.previews.findIndex((it: any) => it == item);
      if(find < 0) {
        let deleteImage = this.motelData?.images.findIndex((image: any) => image.imageUrl == item);
        if(deleteImage >= 0) {
          this.deleteOldImage(this.motelData?.images[deleteImage]?.filePath);
          this.motelData?.images.splice(deleteImage, 1);
        } 
      } else {
        this.previews[find] = '';
      }
    })
    this.previews = this.previews.filter((item: any) => item != '');
    this.listImageFiles = this.listImageFiles.filter((item: any) => item.name);
  }

  deleteOldImage(filePath: any) {
    this.isLoading = true;
    const fileRef = this.fireStorage.ref(filePath);
    if(!filePath || !fileRef) return;
    fileRef.delete().subscribe({
      next: (data) => {
        this.isLoading = false;
        console.log("Old image deleted successfully!");
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.error);
      } 
    })
  }

  onChangeImageIndex(event: any) {
    this.currentIndex = event.to;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if(window.innerWidth <= 768) this.showUserLarge = false;
    else this.showUserLarge = true;
    if(window.innerWidth <= 550) this.showSettingButton = true;
    else this.showSettingButton = false;
  }

  getMotelDetail(key: string) {
    let findItem: any = null;
    switch(key) {
      case "roomType":
        findItem = this.roomTypeList.find(d => d.value === this.motelData[key]);
        return findItem?.label;
      case "directions":
        findItem = this.directionList.find(d => d.value === this.motelData[key]);
        return findItem?.label;
      case "sameHouseWithOwner":
        findItem = this.yesNoList.find(d => d.value === this.motelData[key]);
        return findItem?.label;
      case "renterRequirement":
        findItem = this.renterRequirementList.find(d => d.value === this.motelData[key]);
        return findItem?.label;
      case "hasParkingArea":
        findItem = this.yesNoList.find(d => d.value === this.motelData[key]);
        return findItem?.label;
      case "electricPrice":
        if(this.motelData[key] == 0) return "Giá Nhà nước";
        return `${this.motelData[key]} ${this.motelData?.currencyUnit}`;
      case "waterPrice":
        if(this.motelData[key] == 0) return "Giá Nhà nước";
        return `${this.motelData[key]} ${this.motelData?.currencyUnit}`;
      default:
        return;
    }
  }

  onBtnCopy(value: string) {
    navigator.clipboard.writeText(value);
    this.showSuccess('Copied to clipboard successfully!');
  }

  copyMessage(value: string): void {
    navigator.clipboard.writeText(value);
    this.message.create('success', 'Copied to clipboard successfully!');
  }

  getUserAvt(user: any) {
    return user?.avatarInfo?.avatarUrl ?? '../../../assets/img/default-avatar.jpg';
  }
}
