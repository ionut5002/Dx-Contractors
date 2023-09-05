import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Auth/login/login.component';
import { RegisterComponent } from './Auth/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './Auth/auth.guard';
import { CreateEditClientComponent } from './Clients/create-edit-client/create-edit-client.component';
import { ViewClientsComponent } from './Clients/view-clients/view-clients.component';
import { CreateEditQuotationComponent } from './Quotations/create-edit-quotation/create-edit-quotation.component';
import { ViewQuotationsComponent } from './Quotations/view-quotations/view-quotations.component';
import { CreateEditJobComponent } from './Jobs/create-edit-job/create-edit-job.component';
import { ViewJobsComponent } from './Jobs/view-jobs/view-jobs.component';
import { CreateEditInvoiceComponent } from './Invoices/create-edit-invoice/create-edit-invoice.component';
import { ViewInvoicesComponent } from './Invoices/view-invoices/view-invoices.component';
import { CreateEditJobReportComponent } from './JobReport/create-edit-job-report/create-edit-job-report.component';
import { ViewJobReportComponent } from './JobReport/view-job-report/view-job-report.component';
import { ProfileComponent } from './Auth/profile/profile.component';
import { StockComponent } from './stock/stock.component';


const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'edit-client/:id', component: CreateEditClientComponent, canActivate: [AuthGuard]  },
  { path: 'create-client', component: CreateEditClientComponent, canActivate: [AuthGuard]  },
  { path: 'view-clients', component: ViewClientsComponent, canActivate: [AuthGuard]  },
  { path: 'create-quotation', component: CreateEditQuotationComponent, canActivate: [AuthGuard]  },
  { path: 'edit-quotation/:id', component: CreateEditQuotationComponent, canActivate: [AuthGuard]  },
  { path: 'view-quotations', component: ViewQuotationsComponent, canActivate: [AuthGuard]  },
  { path: 'create-job', component: CreateEditJobComponent, canActivate: [AuthGuard]  },
  { path: 'edit-job/:id', component: CreateEditJobComponent, canActivate: [AuthGuard]  },
  { path: 'view-jobs', component: ViewJobsComponent, canActivate: [AuthGuard]  },
  { path: 'create-invoice', component: CreateEditInvoiceComponent, canActivate: [AuthGuard]  },
  { path: 'edit-invoice/:id', component: CreateEditInvoiceComponent, canActivate: [AuthGuard]  },
  { path: 'view-invoices', component: ViewInvoicesComponent, canActivate: [AuthGuard]  },
  { path: 'create-job-report', component: CreateEditJobReportComponent, canActivate: [AuthGuard]  },
  { path: 'edit-job-report/:id', component: CreateEditJobReportComponent, canActivate: [AuthGuard]  },
  { path: 'view-job-reports', component: ViewJobReportComponent, canActivate: [AuthGuard]  },
  { path: 'view-stock', component: StockComponent, canActivate: [AuthGuard]  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
