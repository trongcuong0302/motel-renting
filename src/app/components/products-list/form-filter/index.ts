import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { UserService } from "../../../services/user.service";
import { ProvinceService } from "../../../services/province.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage'
import { finalize } from 'rxjs';
import { ProductsService } from 'src/app/services/products.service';
import { FilterService } from 'src/app/services/filters.service';
import { BaseComponent } from 'src/app/base/baseComponent';
import { NzCarouselComponent } from 'ng-zorro-antd/carousel';
import { NzMarks } from 'ng-zorro-antd/slider';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: '[form-filter]',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class FormFilter extends BaseComponent implements OnInit{
  searchKeyword: string = '';
  filterName: string = '';
  isClear: boolean = false;
  isVisible = false;
  isBtnAddFilter: boolean = false;
  isBtnSaveFilter: boolean = false;
  isBtnChooseFilter: boolean = false;
  isBtnRemoveFilter: boolean = false;
  filterListExist: boolean = false;
  filterIndex: number = -1;
  clearData: any = {};
  provinceList: any = [];
  location = [];
  listFilterData: any = {};
  accountData: any = {}
  roomType: string = '';
  countFilter: number = 0;
  checked: boolean = false;
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
  rateOptionList = [
    { label: 'Từ 0 trở lên', value: '0' },
    { label: 'Từ 1 trở lên', value: '1' },
    { label: 'Từ 2 trở lên', value: '2' },
    { label: 'Từ 3 trở lên', value: '3' },
    { label: 'Từ 4 trở lên', value: '4' },
    { label: 'Từ 5 trở lên', value: '5' }
  ]
  areaOptionList = [
    { label: 'Dưới 20', value: '0' },
    { label: 'Từ 20 - 30', value: '1' },
    { label: 'Từ 30 - 50', value: '2' },
    { label: 'Từ 50 - 70', value: '3' },
    { label: 'Từ 70 - 90', value: '4' },
    { label: 'Trên 90', value: '5' }
  ]
  numberOptionList = [
    { label: 'Từ 0 trở lên', value: '0' },
    { label: 'Từ 1 trở lên', value: '1' },
    { label: 'Từ 2 trở lên', value: '2' },
    { label: 'Từ 3 trở lên', value: '3' },
    { label: 'Từ 4 trở lên', value: '4' },
    { label: 'Từ 5 trở lên', value: '5' }
  ]
  marks: NzMarks = {
    0: '0',
    15: '15'
  };

  @Output() onSearchEvent: EventEmitter<any> = new EventEmitter();

  override ngOnInit(): void {
    super.ngOnInit();
    this.getProvinceList();
    
    this.isLoading = true;
    this.userService.getUser().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.accountData = data.data;
        this.getFilterList();
      },
      error: (error) => {
        this.isLoading = false;
        console.log(error.error.message);
      }
    });
  }

  constructor(private fb: NonNullableFormBuilder,
    private modal: NzModalService,
    private userService: UserService,
    private translateService: TranslateService,
    private provinceService: ProvinceService,
    private router: Router,
    private notification: NzNotificationService,
    private filterService: FilterService) {
    super(notification, router, userService);
  }

  validateForm: FormGroup<{
    roomType: FormControl<string>;
    roomStatus: FormControl<string>;
    area: FormControl<string>;
    rate: FormControl<string>;
    price: FormControl<any>;
    directions: FormControl<string>;
    sameHouseWithOwner: FormControl<string>;
    renterRequirement: FormControl<string>;
    hasParkingArea: FormControl<string>;
    numberOfAirConditioners: FormControl<string>;
    numberOfWaterHeaters: FormControl<string>;
    numberOfBathrooms: FormControl<string>;
    numberOfBedrooms: FormControl<string>;
    location: FormControl<string>;
  }> = this.fb.group({
    roomType: [''],
    roomStatus: [''],
    area: [''],
    rate: [''],
    price: [[0, 0]],
    directions: [''],
    sameHouseWithOwner: [''],
    renterRequirement: [''],
    hasParkingArea: [''],
    numberOfAirConditioners: [''],
    numberOfWaterHeaters: [''],
    numberOfBathrooms: [''],
    numberOfBedrooms: [''],
    location: [''],
  });

  getFilterList() {
    this.isLoading = true;
    this.filterService.getAFilter(this.accountData?._id).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.filterListExist = true;
        this.listFilterData = data?.data;
      },
      error: (err) => {
        this.filterListExist = false;
        this.listFilterData = { list: []};
        this.isLoading = false;
        //if(err.error.message == "Not Found") this.showError(this.translateService.instant("list.getListFilterError"))
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
        if(error.error.message == "Can not find any items in the database") this.showError(this.translateService.instant("user.getProvinceError"))
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

  prepareLocationData() {
    let formData: any = this.validateForm.value;
    if(this.location) {
      let province = this.provinceList.find((province:any) => province.value == this.location[0]);
      let district = province?.children?.length > 0 ? province?.children.find((district:any) => district.value == this.location[1]) : null;
      let ward = district?.children?.length > 0 ? district?.children.find((ward:any) => ward.value == this.location[2]) : null;
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

  onSearch(i:any = null) {
    this.prepareLocationData();
    this.validateForm.get('roomType')?.setValue(this.roomType);
    let formData: any = this.validateForm.value;
    formData['search'] = this.searchKeyword;
    formData['isMyMotel'] = this.checked;
    this.onSearchEvent.emit(formData);
    this.getNumberOfFilter();
    if(this.isBtnAddFilter) this.addFilter(formData);
    if(this.isBtnSaveFilter) this.saveFilter(formData, i);
  }

  saveFilter(formData: any, i: number) {
    this.isBtnSaveFilter = false;
    this.listFilterData.list[i] = {name: this.filterName, formData: formData};
    this.isLoading = true;
    this.filterService.updateFilterById(this.listFilterData?._id, this.listFilterData).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.showSuccess(this.translateService.instant("list.saveFilterSuccess"))
      },
      error: (err) => {
        this.isLoading = false;
        if(err.error.message == "Not Found") this.showError(this.translateService.instant("list.notFoundFilter"))
        else if(err.error.message == "Invalid data") this.showError(this.translateService.instant("add.invalidData"))
      }
    });
  }

  addFilter(formData: any) {
    this.isBtnAddFilter = false;
    if(this.filterListExist) {
      this.listFilterData.list.push({name: this.filterName, formData: formData});
      this.isLoading = true;
      this.filterService.updateFilterById(this.listFilterData?._id, this.listFilterData).subscribe({
        next: (data) => {
          this.isLoading = false;
          this.showSuccess(this.translateService.instant("list.addFilterSuccess"))
        },
        error: (err) => {
          this.isLoading = false;
          if(err.error.message == "Not Found") this.showError(this.translateService.instant("list.notFoundFilter"))
          else if(err.error.message == "Invalid data") this.showError(this.translateService.instant("add.invalidData"))
        }
      });
    } else {
      this.listFilterData.list.push({name: this.filterName, formData: formData});
      this.listFilterData['userId'] = this.accountData._id;
      this.isLoading = true;
      this.filterService.postAFilter(this.listFilterData).subscribe({
        next: (data) => {
          this.isLoading = false;
          this.showSuccess(this.translateService.instant("list.addFilterSuccess"))
        },
        error: (err) => {
          this.isLoading = false;
          if(err.error.message == "Invalid data") this.showError(this.translateService.instant("add.invalidData"))
        }
      });
    }
    this.onChooseFilter(this.listFilterData.list.length-1);
  }

  onClearInput() {
    this.isClear = true;
    this.clearData = this.validateForm.value;
    this.clearData['search'] = this.searchKeyword;
    this.clearData['isMyMotel'] = this.checked;
    this.clearData['locationSelect'] = this.location;
    for(let key in this.validateForm.controls) {
      if(key == 'price') this.validateForm.get(key)?.setValue([0, 0]);
      else this.validateForm.get(key)?.setValue('');
    }
    this.searchKeyword = '';
    this.checked = false;
    this.roomType = '';
    this.location = [];
  }

  showModal(): void {
    this.isClear = false;
    this.isVisible = true;
  }

  handleOk(): void {
    if(this.isBtnAddFilter || this.isBtnSaveFilter || this.isBtnChooseFilter) {
      if(this.filterName == '') {
        this.showError(this.translateService.instant("list.filterNameEmpty"));
        return;
      }
    }
    this.isVisible = false;
    this.onSearch();
  }

  handleCancel(): void {
    if(this.isClear) {
      this.searchKeyword = this.clearData['search'];
      this.checked = this.clearData['isMyMotel'];
      this.roomType = this.clearData['roomType'];
      this.location = this.clearData['locationSelect'];
      for(let key in this.validateForm.controls) {
        this.validateForm.get(key)?.setValue(this.clearData[key]);
      }
    }
    this.filterName = this.listFilterData.list[this.filterIndex]?.name ?? '';
    this.isBtnAddFilter = false;
    this.isVisible = false;
  }

  formatter(value: number): string {
    return `${value} triệu VND`;
  }

  onClearSearch() {
    this.searchKeyword = '';
    this.onSearch();
  }

  getNumberOfFilter() {
    this.countFilter = 0;
    for(let key in this.validateForm.controls) {
      if(key != 'roomType' && key != 'price') {
        if(this.validateForm.get(key)?.value) this.countFilter++;
      }
      if(key == 'price' && (this.validateForm.get('price')?.value[0] != 0 || this.validateForm.get('price')?.value[1] != 0)) this.countFilter++;
    }
    return this.countFilter;
  }

  onBtnClearRadio(key: any) {
    this.validateForm.get(key)?.setValue('');
  }

  onBtnAddFilter() {
    this.isBtnAddFilter = true;
    this.filterName = this.translateService.instant("list.filterNameLabel");
    this.filterName += ` ${this.listFilterData.list.length + 1}`;
    this.showModal();
  }

  onBtnSaveFilter(i: number) {
    this.isBtnSaveFilter = true;
    this.onSearch(i);
  }

  onDefaultFilter() {
    this.filterName = '';
    this.isBtnChooseFilter = false;
    this.filterIndex = -1;
    this.onClearInput();
    this.onSearch();
  }

  onChooseFilter(i: number) {
    if(this.isBtnRemoveFilter == true) return;
    this.isBtnChooseFilter = true;
    this.filterIndex = i;
    let filter  = this.listFilterData.list[i].formData;
    this.filterName = this.listFilterData.list[i].name;
    this.searchKeyword = filter['search'];
    this.checked = filter['isMyMotel'];
    this.roomType = filter['roomType'];
    this.location = filter['locationSelect'];
    for(let key in this.validateForm.controls) {
      this.validateForm.get(key)?.setValue(filter[key]);
    }
    this.onSearch(i);
  }

  onBtnEditFilter(i: number) {
    this.onChooseFilter(i);
    this.showModal();
  }

  onBtnRemoveFilter(i: number) {
    this.isBtnRemoveFilter = true;
    this.modal.confirm({
      nzTitle: `${this.translateService.instant("list.removeFilterConfirm")} <strong>${this.listFilterData.list[i].name}</strong>?`,
      nzOkText: this.translateService.instant("add.yes"),
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: this.translateService.instant("add.no"),
      nzOnOk: () => this.removeFilter(i),
      nzOnCancel: () => {
        this.isBtnRemoveFilter = false;
        this.modal.closeAll();
      } 
    })
  }

  removeFilter(i: number) {
    this.isBtnRemoveFilter = false;
    this.listFilterData.list.splice(i, 1);
    this.isLoading = true;
    this.filterService.updateFilterById(this.listFilterData?._id, this.listFilterData).subscribe({
      next: (data) => {
        this.isLoading = false;
        if(i== this.filterIndex) this.onDefaultFilter();
        this.showSuccess(this.translateService.instant("list.removeFilterSuccess"))
      },
      error: (err) => {
        this.isLoading = false;
        if(err.error.message == "Not Found") this.showError(this.translateService.instant("list.getListFilterError"))
      }
    });
  }

  onFilterMyList() {
    this.onSearch();
  }
}
