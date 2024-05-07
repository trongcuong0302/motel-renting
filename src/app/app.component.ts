import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  isLoading = false;

  constructor(private translateService: TranslateService) {
    //this.translateService.setDefaultLang('vi');
    this.translateService.use(localStorage.getItem('lang') || 'vi');

  }

  onGetUser() {
    this.isLoading = true;
  }

  onGetUserDone() {
    this.isLoading = false;
  }
}
