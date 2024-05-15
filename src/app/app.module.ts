import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { registerLocaleData } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzStatisticModule } from 'ng-zorro-antd/statistic'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzCascaderModule } from 'ng-zorro-antd/cascader';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireStorageModule } from "@angular/fire/compat/storage";
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AgmCoreModule} from '@agm/core';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import en from '@angular/common/locales/en';
registerLocaleData(en);

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BaseComponent } from './base/baseComponent';
import { AddProductComponent } from './components/add-product/add-product.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { AuthComponent } from './components/auth';
import { LoginComponent } from './components/auth/login';
import { RegisterComponent } from './components/auth/register';
import { TopnavComponent } from './components/topnav';
import { ResetPasswordComponent } from './components/auth/reset-password';
import { UserProfile } from './components/user';
import { environment } from 'src/environment/environment';
import { MapComponent } from './components/map-component';
import { AddRenterComponent } from './components/add-renter-component';
import { VerifyAccountComponent } from './components/auth/verify-account';
import { FormFilter } from './components/products-list/form-filter';
import { ContactComponent } from './components/contact-us';
import { UserListComponent } from './components/admin/list-user';
import { FeedbackListComponent } from './components/admin/message';
import { UserDetail } from './components/user/user-detail';
import { AddUser } from './components/admin/add-user';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    BaseComponent,
    AddProductComponent,
    ProductDetailsComponent,
    ProductsListComponent,
    StatisticsComponent,
    AuthComponent,
    LoginComponent,
    RegisterComponent,
    TopnavComponent,
    ResetPasswordComponent,
    UserProfile,
    MapComponent,
    AddRenterComponent,
    VerifyAccountComponent,
    FormFilter,
    ContactComponent,
    UserListComponent,
    FeedbackListComponent,
    UserDetail,
    AddUser
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NzButtonModule,
    NzTableModule,
    NzTypographyModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    BrowserAnimationsModule,
    NzLayoutModule,
    NzGridModule,
    NzDescriptionsModule,
    NzPopconfirmModule,
    NzMessageModule,
    NzResultModule,
    NzDropDownModule,
    NzIconModule,
    NzModalModule,
    NzTabsModule,
    NzSpaceModule,
    NzDatePickerModule,
    NzSelectModule,
    NzStatisticModule,
    ReactiveFormsModule,
    NzCheckboxModule,
    NzNotificationModule,
    NzCascaderModule,
    NzUploadModule,
    NzCarouselModule,
    NzPopoverModule,
    NzToolTipModule,
    NzPaginationModule,
    NzSpinModule,
    NzTagModule,
    NzRateModule,
    NzCommentModule,
    NzAvatarModule,
    NzRadioModule,
    NzSliderModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireStorageModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCaKbVhcX_22R_pRKDYuNA7vox-PtGaDkI'
    })
  ],
  providers: [{ provide: NZ_I18N, useValue: en_US }, HttpClient
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
