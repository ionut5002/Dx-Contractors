import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { provideStorage,getStorage } from '@angular/fire/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';

// Import necessary Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Import necessary components
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateEditClientComponent } from './Clients/create-edit-client/create-edit-client.component';
import { ViewClientsComponent } from './Clients/view-clients/view-clients.component';
import { ConfirmationDialogComponent } from './Extras/confirmation-dialog/confirmation-dialog.component';
import { CreateEditQuotationComponent } from './Quotations/create-edit-quotation/create-edit-quotation.component';
import { ViewQuotationsComponent } from './Quotations/view-quotations/view-quotations.component';
import { LoginComponent } from './Auth/login/login.component';
import { RegisterComponent } from './Auth/register/register.component';
import { ViewJobsComponent } from './Jobs/view-jobs/view-jobs.component';
import { CreateEditJobComponent } from './Jobs/create-edit-job/create-edit-job.component';
import { CreateEditInvoiceComponent } from './Invoices/create-edit-invoice/create-edit-invoice.component';
import { ViewInvoicesComponent } from './Invoices/view-invoices/view-invoices.component';
import { ViewJobReportComponent } from './JobReport/view-job-report/view-job-report.component';
import { CreateEditJobReportComponent } from './JobReport/create-edit-job-report/create-edit-job-report.component';
import { MenuComponent } from './Extras/menu/menu.component';
import { NgChartsModule } from 'ng2-charts';
import { ProfileComponent } from './Auth/profile/profile.component';
import { StockComponent } from './stock/stock.component';
import { ServiceWorkerModule } from '@angular/service-worker';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    CreateEditClientComponent,
    ViewClientsComponent,
    ConfirmationDialogComponent,
    CreateEditQuotationComponent,
    ViewQuotationsComponent,
    ViewJobsComponent,
    CreateEditJobComponent,
    CreateEditInvoiceComponent,
    ViewInvoicesComponent,
    ViewJobReportComponent,
    CreateEditJobReportComponent,
    MenuComponent,
    ProfileComponent,
    StockComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    BrowserAnimationsModule,
     // Angular Material modules
     MatCardModule,
     MatInputModule,
     MatButtonModule,
     MatFormFieldModule,
     MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatListModule,
    MatExpansionModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatToolbarModule,
    MatSidenavModule,
    MatGridListModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    NgChartsModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
