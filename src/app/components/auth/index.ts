import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/baseComponent';

@Component({
  selector: 'authentication',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class AuthComponent extends BaseComponent implements OnInit {
  public isLoginPage = true;

  override ngOnInit(): void {
    super.ngOnInit();
  }

  onChangeForm() {
    this.isLoginPage = !this.isLoginPage;
  }

}
