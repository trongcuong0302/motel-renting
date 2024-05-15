import { Component, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { UserService } from "src/app/services/user.service";
import { FeedbackService } from "src/app/services/feedback.service";
import { BaseComponent } from 'src/app/base/baseComponent';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'feedback-list',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class FeedbackListComponent extends BaseComponent implements OnInit {
  feedbackList: any = [];
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
    private feedbackService: FeedbackService,
    private translateService: TranslateService,
    private router: Router,
    private modal: NzModalService,
    private notification: NzNotificationService) { 
      super(notification, router, userService);
    }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadDataFromServer(this.pageIndex, this.pageSize);
  }

  setActiveProduct(feedback: any): void {
    this.currentUser = feedback.userId;
    this.router.navigate([`/users/${this.currentUser}`]);
  }

  loadDataFromServer(pageIndex: number, pageSize: number): void {
    this.isLoading = true;
    let filter = [
      {field: "pageIndex", value: pageIndex, operator: "pagination"},
      {field: "pageSize", value: pageSize, operator: "pagination"},
      {field: "createdDate", value: 'descend', operator: "sort"},
    ];

    this.feedbackService.getAllFeedback(filter).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.total = data.total;
        this.feedbackList = data.data;
        
      },
      error: (err) => {
        this.isLoading = false;
        if(err.error.message == "Can not find any items in the database") this.showError(this.translateService.instant("feedback.getFeedbackError"))
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

  getFeedbackData(feedback: any, key: string) {
    if(key == 'role') {
      if(feedback[key] == 'owner') return this.translateService.instant("feedback.owner")
      if(feedback[key] == 'renter') return this.translateService.instant("feedback.renter")
      if(feedback[key] == 'other') return this.translateService.instant("feedback.other")
    }
    if(key == 'date') return this.formatDate(feedback['createdDate']);
  }

  formatDate(date: any) {
    date = new Date(date);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear() + "  " + strTime;
  }

  confirmDelete(feedback: any) : void {
    if(this.isLoading) return;
    this.modal.confirm({
      nzTitle: this.translateService.instant("feedback.deleteConfirm"),
      nzOkText: this.translateService.instant("add.yes"),
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: this.translateService.instant("add.no"),
      nzOnOk: () => this.deleteFeedback(feedback)
    });
  }

  deleteFeedback(feedback: any) {
    this.isLoading = true;
    this.feedbackService.deleteFeedbackById(feedback._id)
      .subscribe({
        next: (res) => {
          //console.log(res);
          this.isLoading = false;
          this.showSuccess(this.translateService.instant("feedback.deleteSuccess"));
          this.onSearch();
        },
        error: (error) => {
          this.isLoading = false;
          if(error.error.message == "Not Found") this.showError(this.translateService.instant("feedback.deleteError"))
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
