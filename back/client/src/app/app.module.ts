import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';


import { AppComponent } from './app.component';
import { LoginComponent } from './component/login/login.component';
import { PageErrorComponent } from './component/404-error/404-error.component';

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent, data: { title: 'login' } },
  { path: 'error', component: PageErrorComponent, data: { title: 'error' } },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', component: PageErrorComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PageErrorComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      appRoutes, { enableTracing: true } // <-- debugging purposes only
    )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
