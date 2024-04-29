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

  @Input() latLng = { lat: 21.0278, lng: 105.8342 };
  @Input() enableClick = true;
  @Output() placeChanged = new EventEmitter();

  searchInput: string = "";
  userList: any = [];
  selectedUserList: any = [];

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
      {field: "", value: this.searchInput, operator: "includes"},
    ];
    this.userService.getAllUser(filter).subscribe({
      next: (data) => {
        this.userList = data.data;
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
    let item = this.selectedUserList.filter((item: any) => item.name == user.name && item.email == user.email && item.phoneNumber == user.phoneNumber);
    if(!item.length) this.selectedUserList.push(user); 
    else this.showError('User has already been selected!');
  }

  confirmDelete(i: number) : void {
    if(this.isLoading) return;
    this.modal.confirm({
      nzTitle: 'Do you want to delete this user?',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'No',
      nzOnOk: () => this.deleteUser(i)
    });
  }

  deleteUser(i: number) {
    this.selectedUserList.splice(i, 1); 
  }
}
