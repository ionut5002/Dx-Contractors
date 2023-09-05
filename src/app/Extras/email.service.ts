import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quotation } from '../Quotations/quotation.model';
import { SharedService } from './shared.service';
import { User } from '../Auth/user';
import { AuthService } from '../Auth/auth.service';
import { switchMap, take, tap } from 'rxjs/operators';
import { Invoice } from '../Invoices/invoice.model';
import { JobReport } from '../JobReport/job-report.model';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  users: User[] = [];
  currentUser: User | undefined | null  = null;

  private firebaseFunctionUrl = 'https://us-central1-dx-contractors.cloudfunctions.net/';

  constructor(private http: HttpClient, private sharedService: SharedService, private authService: AuthService) { }

  // NEW EMAILS
  sendQuotationEmail(quotation: Quotation): Observable<any> {
    
    return this.sharedService.getUsers().pipe(
      take(1),
      switchMap((users: User[]) => {
        this.users = users;
        const currentUserUid = this.authService.getCurrentUserUid();
        if (currentUserUid) {
          this.currentUser = this.users.find(user => user.uid === currentUserUid);
        }
        const payload = {
          quotation,
          requestUser: this.currentUser,
          allUsers: this.users,
        };
        console.log(payload)
       
        return this.http.post(this.firebaseFunctionUrl + 'sendQuotationEmail', payload, { responseType: 'text' });
      })
    );
  }

  sendInvoiceEmail(invoice: Invoice): Observable<any> {
    
    return this.sharedService.getUsers().pipe(
      take(1),
      switchMap((users: User[]) => {
        this.users = users;
        const currentUserUid = this.authService.getCurrentUserUid();
        if (currentUserUid) {
          this.currentUser = this.users.find(user => user.uid === currentUserUid);
        }
        const payload = {
          invoice,
          requestUser: this.currentUser,
          allUsers: this.users,
        };
        console.log(payload)
       
        return this.http.post(this.firebaseFunctionUrl + 'sendInvoiceEmail', payload, { responseType: 'text' });
      })
    );
  }

  sendJobReportEmail(jobReport: JobReport): Observable<any> {
    
    return this.sharedService.getUsers().pipe(
      take(1),
      switchMap((users: User[]) => {
        this.users = users;
        const currentUserUid = this.authService.getCurrentUserUid();
        if (currentUserUid) {
          this.currentUser = this.users.find(user => user.uid === currentUserUid);
        }
        const payload = {
          jobReport,
          requestUser: this.currentUser,
          allUsers: this.users,
        };
        console.log(payload)
       
        return this.http.post(this.firebaseFunctionUrl + 'sendJobReportEmail', payload, { responseType: 'text' });
      })
    );
  }

  // REMINDER EMAILS
  resendQuotationEmail(quotation: Quotation): Observable<any> {
    
    return this.sharedService.getUsers().pipe(
      take(1),
      switchMap((users: User[]) => {
        this.users = users;
        const currentUserUid = this.authService.getCurrentUserUid();
        if (currentUserUid) {
          this.currentUser = this.users.find(user => user.uid === currentUserUid);
        }
        const payload = {
          quotation,
          requestUser: this.currentUser,
          allUsers: this.users,
        };
        console.log(payload)
       
        return this.http.post(this.firebaseFunctionUrl + 'resendQuotationEmail', payload, { responseType: 'text' });
      })
    );
  }

  resendInvoiceEmail(invoice: Invoice): Observable<any> {
    
    return this.sharedService.getUsers().pipe(
      take(1),
      switchMap((users: User[]) => {
        this.users = users;
        const currentUserUid = this.authService.getCurrentUserUid();
        if (currentUserUid) {
          this.currentUser = this.users.find(user => user.uid === currentUserUid);
        }
        const payload = {
          invoice,
          requestUser: this.currentUser,
          allUsers: this.users,
        };
        console.log(payload)
       
        return this.http.post(this.firebaseFunctionUrl + 'resendInvoiceEmail', payload, { responseType: 'text' });
      })
    );
  }

  resendJobReportEmail(jobReport: JobReport): Observable<any> {
    
    return this.sharedService.getUsers().pipe(
      take(1),
      switchMap((users: User[]) => {
        this.users = users;
        const currentUserUid = this.authService.getCurrentUserUid();
        if (currentUserUid) {
          this.currentUser = this.users.find(user => user.uid === currentUserUid);
        }
        const payload = {
          jobReport,
          requestUser: this.currentUser,
          allUsers: this.users,
        };
        console.log(payload)
       
        return this.http.post(this.firebaseFunctionUrl + 'resendJobReportEmail', payload, { responseType: 'text' });
      })
    );
  }
}
