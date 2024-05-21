import { Component, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { UserService } from "src/app/services/user.service";
import { BaseComponent } from 'src/app/base/baseComponent';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'user-list',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class UserListComponent extends BaseComponent implements OnInit {
  userList: any = [];
  userData: any = {};
  currentUser: any = {};
  pageSize = 10;
  pageIndex = 1;
  total = 1;
  searchInput: any = '';
  statusList = [
    { label: 'Đã kích hoạt', value: "active" },
    { label: 'Chưa kích hoạt', value: "inactive" },
    { label: 'Đã bị chặn', value: "block" }
  ]
  status: string = '';
  roleList = [
    { label: 'Quản trị viên', value: 0 },
    { label: 'Người dùng', value: 1 }
  ]
  role: number = -1;
  isVisible: boolean = false;
  isConfirmAddUser: boolean = false;
  
  constructor(
    private nzMessageService: NzMessageService,
    private userService: UserService,
    private translateService: TranslateService,
    private router: Router,
    private modal: NzModalService,
    private notification: NzNotificationService) { 
      super(notification, router, userService);
    }

  override ngOnInit(): void {
    super.ngOnInit();
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getLabelForArray();
    });
    this.getUserProfile();
    this.loadDataFromServer(this.pageIndex, this.pageSize);
  }

  getLabelForArray() {
    this.roleList[0].label = this.translateService.instant("userList.roleAdmin");
    this.roleList[1].label = this.translateService.instant("userList.roleUser");
  }

  getUserProfile() {
    this.isLoading = true;
    this.userService.getUser().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.userData = data?.data;
        if(this.userData.role == 1) {
          this.router.navigate(['/products']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        if(error.error.message == "Unauthenticated") this.showError(this.translateService.instant("user.unauthenticated"))
        else if(error.error.message == "Not Found") this.showError(this.translateService.instant("user.notFoundAccount"))
      }
    });
  }

  setActiveProduct(user: any): void {
    this.currentUser = user;
    const url = this.router.serializeUrl(
      this.router.createUrlTree([`/users/${this.currentUser._id}`])
    );
  
    window.open(url, '_blank');
  }

  loadDataFromServer(pageIndex: number, pageSize: number): void {
    this.isLoading = true;
    let filter = [
      {field: "pageIndex", value: pageIndex, operator: "pagination"},
      {field: "pageSize", value: pageSize, operator: "pagination"},
      {field: "", value: this.searchInput, operator: "includes"}
    ];

    if(this.role != null && this.role >= 0) filter.push({field: "role", value: this.role, operator: "matches"});
    if(this.status) filter.push({field: "status", value: this.status, operator: "matches"});

    this.userService.getAllUser(filter).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.total = data.total;
        this.userList = data.data;
        
      },
      error: (err) => {
        this.isLoading = false;
        if(err.error.message == "Can not find any items in the database") this.showError(this.translateService.instant("add.getUserError"))
      }
    })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const {pageIndex, pageSize} = params;
    this.loadDataFromServer(pageIndex, pageSize);
  }

  onSearch() {
    this.pageSize = 10;
    this.pageIndex = 1;
    this.loadDataFromServer(this.pageIndex, this.pageSize);
  }

  onClearInput() {
    this.searchInput = "";
    this.pageSize = 10;
    this.pageIndex = 1;
    this.loadDataFromServer(this.pageIndex, this.pageSize);
  }

  getUserData(user: any, key: string) {
    if(key == 'status') {
      if(user[key] == 'active') return this.translateService.instant("userList.statusActive")
      if(user[key] == 'inactive') return this.translateService.instant("userList.statusInactive")
      if(user[key] == 'block') return this.translateService.instant("userList.statusBlocked")
    }
  }

  confirmDelete(user: any) : void {
    if(this.isLoading) return;
    this.modal.confirm({
      nzTitle: this.translateService.instant("userList.deleteConfirm"),
      nzOkText: this.translateService.instant("add.yes"),
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: this.translateService.instant("add.no"),
      nzOnOk: () => this.deleteUser(user)
    });
  }

  deleteUser(user: any) {
    this.isLoading = true;
    this.userService.deleteUserById(user._id)
      .subscribe({
        next: (res) => {
          //console.log(res);
          this.isLoading = false;
          this.showSuccess(this.translateService.instant("userList.deleteSuccess"));
          this.onSearch();
        },
        error: (error) => {
          this.isLoading = false;
          if(error.error.message == "Not Found") this.showError(this.translateService.instant("userList.notFoundError"))
        } 
      }); 
  }

  confirmBlock(user: any) : void {
    if(this.isLoading) return;
    this.modal.confirm({
      nzTitle: this.translateService.instant("userList.blockConfirm"),
      nzOkText: this.translateService.instant("add.yes"),
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: this.translateService.instant("add.no"),
      nzOnOk: () => this.blockUser(user)
    });
  }

  blockUser(user: any) {
    this.isLoading = true;
    let dataUpdate = user;
    dataUpdate['status'] = "block";
    this.userService.updateUserProfile(user._id, dataUpdate)
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          this.onSearch();
          this.showSuccess(this.translateService.instant("userList.blockSuccess"));
        },
        error: (error) => {
          this.isLoading = false;
          if(error.error.message == "Invalid data") this.showError(this.translateService.instant("userList.invalidError"))
          else if(error.error.message == "Not Found") this.showError(this.translateService.instant("userList.notFoundError"))
        }
      }); 
  }

  confirmUnblock(user: any) : void {
    if(this.isLoading) return;
    this.modal.confirm({
      nzTitle: this.translateService.instant("userList.unblockConfirm"),
      nzOkText: this.translateService.instant("add.yes"),
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: this.translateService.instant("add.no"),
      nzOnOk: () => this.unblockUser(user)
    });
  }

  unblockUser(user: any) {
    this.isLoading = true;
    let dataUpdate = user;
    dataUpdate['status'] = "active";
    this.userService.updateUserProfile(user._id, dataUpdate)
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          this.onSearch();
          this.showSuccess(this.translateService.instant("userList.unblockSuccess"));
        },
        error: (error) => {
          this.isLoading = false;
          if(error.error.message == "Invalid data") this.showError(this.translateService.instant("userList.invalidError"))
          else if(error.error.message == "Not Found") this.showError(this.translateService.instant("userList.notFoundError"))
        }
      }); 
  }

  confirmUpdateRole(user: any, role: any) : void {
    if(this.isLoading) return;
    this.modal.confirm({
      nzTitle: role == 1 ? this.translateService.instant("userList.downgradeAdminConfirm") : this.translateService.instant("userList.upgradeAdminConfirm"),
      nzOkText: this.translateService.instant("add.yes"),
      nzOkType: 'primary',
      nzCancelText: this.translateService.instant("add.no"),
      nzOnOk: () => this.updateRoleUser(user, role)
    });
  }

  updateRoleUser(user: any, role: any) {
    this.isLoading = true;
    let dataUpdate = user;
    dataUpdate['role'] = role;
    this.userService.updateUserProfile(user._id, dataUpdate)
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          if(this.userData._id == user._id) this.getUserProfile();
          this.onSearch();
          if(role == 1) this.showSuccess(this.translateService.instant("userList.downgradeAdminSuccess"));
          else this.showSuccess(this.translateService.instant("userList.upgradeAdminSuccess"));
        },
        error: (error) => {
          this.isLoading = false;
          if(error.error.message == "Invalid data") this.showError(this.translateService.instant("userList.invalidError"))
          else if(error.error.message == "Not Found") this.showError(this.translateService.instant("userList.notFoundError"))
        }
      }); 
  }

  openModal() {
    this.isVisible = true;
    this.isConfirmAddUser = false;
  }

  handleOk() {
    this.isConfirmAddUser = true;
  }

  handleCancel() {
    this.isVisible = false;
  }

  onAddUser() {
    this.isConfirmAddUser = false;
    this.isVisible = false;
    this.loadDataFromServer(this.pageIndex, this.pageSize);
  }

  onAddUserFail() {
    this.isConfirmAddUser = false;
  }

}
