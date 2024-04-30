import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { BaseComponent } from '../../base/baseComponent';
import { UserService } from "../../services/user.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';

@Component({
  selector: '[add-renter-component]',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class AddRenterComponent extends BaseComponent implements OnInit {

  @Input() selectedUserList: any = [];
  @Output() renterListChanged = new EventEmitter();

  searchInput: string = "";
  userList: any = [];
  
  pageSize: number = 6;
  pageIndex: number = 1;
  total: number = 0;

  override ngOnInit(): void {
    super.ngOnInit();
    this.onSearch();
  }

  constructor(private notification: NzNotificationService,
    private router: Router,
    private userService: UserService,
    private zone: NgZone,
    private modal: NzModalService,) {
      super(notification, router, userService);
  }

  onSearch() {
    let filter = [
      {field: "pageIndex", value: this.pageIndex, operator: "pagination"},
      {field: "pageSize", value: this.pageSize, operator: "pagination"},
      {field: "", value: this.searchInput, operator: "includes"},
      {field: "status", value: "active", operator: "matches"},
    ];
    this.isLoading = true;
    this.userService.getAllUser(filter).subscribe({
      next: (data) => {
        this.total = data.total;
        this.userList = data.data;
        this.userList.forEach((item: any) => {
          item.isSelected = false;
        })
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.showError(err.error.message);
      } 
    })
  }

  onClearInput() {
    this.searchInput = "";
    this.onSearch();
  }
 
  getUserAvt(user: any) {
    return user?.avatarInfo?.avatarUrl ?? '../../../assets/img/default-avatar.jpg';
  }

  addRenter(user: any) {
    user.isSelected = true;
    let item = this.selectedUserList.filter((item: any) => item.name == user.name && item.email == user.email && item.phoneNumber == user.phoneNumber);
    if(!item.length) {
      this.selectedUserList.push(user); 
      this.renterListChanged.emit(this.selectedUserList);
    } 
    else this.showError('User has already been selected!');
  }

  confirmDelete(user: any, i: number) : void {
    if(this.isLoading) return;
    this.modal.confirm({
      nzTitle: 'Do you want to delete this user?',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'No',
      nzOnOk: () => this.deleteUser(user, i)
    });
  }

  deleteUser(user: any, i: number) {
    let userData = this.userList.find((it: any) => it._id === user._id);
    userData.isSelected = false;
    this.selectedUserList.splice(i, 1); 
    this.renterListChanged.emit(this.selectedUserList);
  }

  onChangePageIndex() {
    this.onSearch();
  }
}
