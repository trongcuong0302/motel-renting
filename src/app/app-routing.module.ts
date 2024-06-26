import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddProductComponent } from './components/add-product/add-product.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { AuthComponent } from './components/auth';
import { ResetPasswordComponent } from './components/auth/reset-password';
import { VerifyAccountComponent } from './components/auth/verify-account';
import { UserProfile } from './components/user';
import { ContactComponent } from './components/contact-us';
import { UserListComponent } from './components/admin/list-user';
import { FeedbackListComponent } from './components/admin/message';
import { UserDetail } from './components/user/user-detail';
import { PaymentComponent } from './components/payment';
import { AddBillResult } from './components/payment/add-result';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: AuthComponent },
  { path: 'reset/:token', component: ResetPasswordComponent },
  { path: 'verify/:token', component: VerifyAccountComponent },
  { path: 'profile', component: UserProfile },
  { path: 'products', component: ProductsListComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'add', component: AddProductComponent },
  { path: 'contact-us', component: ContactComponent },
  { path: 'admin/users', component: UserListComponent },
  { path: 'admin/feedback', component: FeedbackListComponent },
  { path: 'users/:id', component: UserDetail },
  { path: 'payment', component: PaymentComponent },
  { path: 'payment/vnpay_return', component: AddBillResult },
  { path: '**', redirectTo: 'products'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
