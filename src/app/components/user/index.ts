import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { UserService } from "../../services/user.service";
import { ProvinceService } from "../../services/province.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/base/baseComponent';
import { AngularFireStorage } from '@angular/fire/compat/storage'
import { Storage } from '@angular/fire/storage'
import { finalize } from 'rxjs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: '[user-profile]',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class UserProfile extends BaseComponent implements OnInit {
  isVisible = false;
  loading = false;
  isShowPassword = false;
  emailReset: string = '';
  isEdit: boolean = false;
  userData: any = {};
  provinceList: any = [];
  location: any = {
    hometown: [],
    address: []
  }
  objectChangePassword: any = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
  avatarUrl: string = '../../../assets/img/default-avatar.jpg';
  selectedImage: any = null;

  @Output() onRegister: EventEmitter<any> = new EventEmitter();

  override ngOnInit(): void {
      super.ngOnInit();
      this.getUserProfile();
      this.getProvinceList();
  }

  constructor(private fb: NonNullableFormBuilder,
    private modal: NzModalService,
    private userService: UserService,
    private translateService: TranslateService,
    private provinceService: ProvinceService,
    private fireStorage: AngularFireStorage,
    private router: Router,
    private notification: NzNotificationService) {
    super(notification, router, userService);
  }

  validateForm: FormGroup<{
    name: FormControl<string>;
    email: FormControl<string>;
    dateOfBirth: FormControl<string>;
    phoneNumber: FormControl<string>;
    hometown: FormControl<string>;
    address: FormControl<string>;
    job: FormControl<string>;
    linkFacebook: FormControl<string>;
  }> = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required]],
    dateOfBirth: [''],
    phoneNumber: ['', [Validators.required]],
    hometown: [''],
    address: [''],
    job: [''],
    linkFacebook: [''],
  });

  getUserProfile() {
    this.isLoading = true;
    this.userService.getUser().subscribe({
      next: (data) => {
        this.userData = data.data;
        if(this.userData?.avatarInfo?.avatarUrl) this.avatarUrl = this.userData?.avatarInfo?.avatarUrl;
        this.isLoading = false;
        Object.keys(this.validateForm.controls).forEach(key => {
          if(key == "dateOfBirth" && data.data[key]) data.data[key] = new Date(data.data[key])
          if(key == "hometown" || key == "address") {
            this.location[key] = data.data[key]?.value;
            this.validateForm.get(key)?.setValue(data.data[key]?.text);
          } 
          else this.validateForm.get(key)?.setValue(data.data[key]);
        })
      },
      error: (error) => {
        this.isLoading = false;
        if(error.error.message == "Unauthenticated") this.showError(this.translateService.instant("user.unauthenticated"))
        else if(error.error.message == "Not Found") this.showError(this.translateService.instant("user.notFoundAccount"))
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

  validateFormData() {
    let data = this.validateForm.value;
    if(!data.name) {
      this.showError(this.translateService.instant("user.nameError"));
      return false;
    }
    const phoneNumberRegex = /(((\+|)84)|0)(3|5|7|8|9)+([0-9]{8})\b/;
    if(!data.phoneNumber || !phoneNumberRegex.test(data.phoneNumber)) {
      this.showError(this.translateService.instant("user.phoneError"));
      return false;
    }
    return true;
  }

  prepareLocationData() {
    let formData: any = this.validateForm.value;
    for(let key of ['hometown', 'address']) {
      if(this.location[key]) {
        let province = this.provinceList.find((province:any) => province.value == this.location[key][0]);
        let district = province.children?.length > 0 ? province.children.find((district:any) => district.value == this.location[key][1]) : null;
        let ward = district.children?.length > 0 ? district.children.find((ward:any) => ward.value == this.location[key][2]) : null;
        let location = "";
        location += `${ward ? ward.label + ', ' : ''}`;
        location += `${district ? district.label + ', ' : ''}`;
        location += `${province ? province.label : ''}`;
        formData[key] = {
          value: this.location[key],
          text: location
        }
        this.validateForm.get(key)?.setValue(location);
      }
    }
    return formData;
  }

  onBtnEdit() {
    if(this.isEdit) {
      if (this.validateFormData()) {
        let formData = this.prepareLocationData();
        this.isLoading = true;
        this.userService.updateUserProfile(this.userData._id, formData).subscribe({
          next: (data) => {
            this.isLoading = false;
            this.showSuccess(this.translateService.instant("user.updateSuccess"));
          },
          error: (error) => {
            this.isLoading = false;
            if(error.error.message == "Invalid data") this.showError(this.translateService.instant("user.invalidData"))
            else if(error.error.message == "Not Found") this.showError(this.translateService.instant("user.notFoundAccount"))
          }
        });
      } else {
        Object.values(this.validateForm.controls).forEach(control => {
          if (control.invalid) {
            control.markAsDirty();
            control.updateValueAndValidity({ onlySelf: true });
          }
        });
        return;
      }
    } else {
      this.validateForm.get("email")?.disable();
    }

    this.isEdit = !this.isEdit;
  }

  onBtnChangePassword() {
    this.isVisible = true;
    this.objectChangePassword = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  }

  handleCancel() {
    this.isVisible = false;
  }

  handleOk() {
    if(this.validateChangePassword()) {
      let object = this.objectChangePassword;
      object['email'] = this.validateForm.get("email")?.value;
      this.isLoading = true;
      this.userService.changePassword(object).subscribe({
        next: (data) => {
          this.isVisible = false;
          this.isLoading = false;
          this.objectChangePassword = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
          }
          this.showSuccess(this.translateService.instant("user.changePasswordSuccess"));
        },
        error: (error) => {
          this.isLoading = false;
          if(error.error.message == "Password is incorrect") this.showError(this.translateService.instant("user.wrongPassword"))
          else if(error.error.message == "Not Found") this.showError(this.translateService.instant("user.notFoundAccount"))
          else if(error.error.message == "Something went wrong while reseting password") this.showError(this.translateService.instant("user.changePasswordError"))
        }
      });
    }
  }

  validateChangePassword() {
    for(let key in this.objectChangePassword) {
      if(!this.objectChangePassword[key]) {
        this.showError(this.translateService.instant("user.passwordEmpty"));
        return false;
      }
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    if(!passwordRegex.test(this.objectChangePassword.newPassword)){
      this.showError(this.translateService.instant("user.passwordInvalid"));
      return false;
    } 
    if(this.objectChangePassword.newPassword != this.objectChangePassword.confirmPassword){
      this.showError(this.translateService.instant("user.passwordConfirmError"));
      return false;
    } 
    return true;
  }

  onChangeImage(event: any) {
    if(event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e:any) => this.avatarUrl = e.target.result;
      reader.readAsDataURL(event.target.files[0]);
      this.selectedImage = event.target.files[0];
    } else {
      this.avatarUrl = '../../../assets/img/default-avatar.jpg';
      this.selectedImage = null;
    }
  }

  onBtnSaveImage() {
    if(!this.selectedImage || !this.selectedImage?.name) return;
    let filePath = `avatars/${this.userData.email}_${this.selectedImage.name}_${new Date().getTime()}`;
    const fileRef = this.fireStorage.ref(filePath);
    this.loading = true;
    this.fireStorage.upload(filePath, this.selectedImage).snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe({
          next: (url) => {
            this.selectedImage = null;
            this.deleteOldAvatar();
            this.avatarUrl = url;
            let avatarInfo = {
              avatarUrl: this.avatarUrl,
              filePath: filePath
            }
            this.userService.updateUserProfile(this.userData._id, { avatarInfo: avatarInfo, isChangeAvatar: true }).subscribe({
              next: (data) => {
                this.loading = false;
                this.showSuccess(this.translateService.instant("user.saveImageSuccess"));
                window.location.reload();
              },
              error: (error) => {
                this.loading = false;
                if(error.error.message == "Invalid data") this.showError(this.translateService.instant("user.invalidData"))
                else if(error.error.message == "Not Found") this.showError(this.translateService.instant("user.notFoundAccount"))
              }
            });
          },
          error: (err) => {
            this.showError(err.error);
          }
        })
      })
    ).subscribe();
  }

  deleteOldAvatar() {
    this.loading = true;
    let filePath = this.userData?.avatarInfo?.filePath;
    const fileRef = this.fireStorage.ref(filePath);
    if(!filePath || !fileRef) return;
    fileRef.delete().subscribe({
      next: (data) => {
        this.loading = false;
        console.log("Old avatar deleted successfully!");
      },
      error: (error) => {
        this.loading = false;
        this.showError(error.error);
      } 
    })
  }

  confirmDelete() : void {
    if(this.avatarUrl == '../../../assets/img/default-avatar.jpg') return;
    this.modal.confirm({
      nzTitle: this.translateService.instant("user.deleteImageContent"),
      nzOkText: this.translateService.instant("user.deleteImageYes"),
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: this.translateService.instant("user.deleteImageNo"),
      nzOnOk: () => this.onDeleteImage()
    });
  }

  onDeleteImage() {
    this.deleteOldAvatar();
    this.selectedImage = null;
    this.avatarUrl = '../../../assets/img/default-avatar.jpg';
    let avatarInfo = {};
    this.loading = true;
    this.userService.updateUserProfile(this.userData._id, { avatarInfo: avatarInfo, isChangeAvatar: true }).subscribe({
      next: (data) => {
        this.loading = false;
        window.location.reload();
      },
      error: (error) => {
        this.loading = false;
        if(error.error.message == "Invalid data") this.showError(this.translateService.instant("user.invalidData"))
        else if(error.error.message == "Not Found") this.showError(this.translateService.instant("user.notFoundAccount"))
      }
    });
  }

  cancelEdit() {
    this.isEdit = false;
    this.getUserProfile();
  }
}
