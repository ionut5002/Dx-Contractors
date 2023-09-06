import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { JobService } from '../Jobs/job.service';
import { Job } from '../Jobs/job.model';
import { QuotationService } from '../Quotations/quotation.service';
import { InvoiceService } from '../Invoices/invoice.service';
import { JobReportService } from '../JobReport/job-report.service';
import { ClientService } from '../Clients/client.service';
import { AuthService } from '../Auth/auth.service';
import { User } from '../Auth/user';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private jobsSubject = new BehaviorSubject<any[]>([]);
  private invoicesSubject = new BehaviorSubject<any[]>([]);
  private quotationsSubject = new BehaviorSubject<any[]>([]);
  private jobReportsSubject = new BehaviorSubject<any[]>([]);
  private clientsSubject = new BehaviorSubject<any[]>([]);
  private usersSubject = new BehaviorSubject<any[]>([]);
  private userSubject = new BehaviorSubject<any>({});
  private readonly storage: Storage = inject(Storage);

  constructor(private jobService: JobService, 
    private quotationService: QuotationService, 
    private invoiceService: InvoiceService, 
    private jobReportService: JobReportService, 
    private clientService: ClientService,
    private authService: AuthService) { }

  // Jobs
  fetchJobs(): void {
    this.jobService.getJobs().subscribe(data => {
      this.jobsSubject.next(data);
    });
  }

  getJobs(): Observable<Job[]> {
    return this.jobsSubject.asObservable();
  }

  fetchInvoices(): void {
    this.invoiceService.getInvoices().subscribe(data => {
      this.invoicesSubject.next(data);
  });
  }

  getInvoices(): Observable<any[]> {
    return this.invoicesSubject.asObservable();
  }

  // Quotations
  fetchQuotations(): void {
    this.quotationService.getQuotations().subscribe(data => {
      this.quotationsSubject.next(data);
    });
  }

  getQuotations(): Observable<any[]> {
    return this.quotationsSubject.asObservable();
  }

  // Job Reports
  fetchJobReports(): void {
    this.jobReportService.getJobReports().subscribe(data => {
      this.jobReportsSubject.next(data);
  });
  }

  getJobReports(): Observable<any[]> {
    return this.jobReportsSubject.asObservable();
  }

  

// Clients
fetchClients(): void {
  this.clientService.getClients().subscribe(data => {
    this.clientsSubject.next(data);
});
}

getClients(): Observable<any[]> {
  return this.clientsSubject.asObservable();
}

// Users
fetchUsers(): void {
  this.authService.getUsers().subscribe(data => {
    this.usersSubject.next(data);
  });
}

getUsers(): Observable<User[]> {
  return this.usersSubject.asObservable();
}

// Current User
fetchUser(): void {
  this.authService.getUser().subscribe(data => {
    this.usersSubject.next(data);
  });
}

getUser(): Observable<User[]> {
  return this.usersSubject.asObservable();
}

uploadFile(jobReportId: string, file: File): Observable<string> {
  const randomString = this.generateRandomString();
  const filePath = `JobReportFiles/${randomString}_${file.name}`;
  const storageRef = ref(this.storage, filePath);

  // Upload the file and get the download URL
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Observable<any>(observer => {
    uploadTask.on('state_changed',
      snapshot => {
        // Handle progress
      },
      error => {
        observer.error(error);
      },
      async () => {
        // Get download URL
        await getDownloadURL(storageRef).then(url => {
          observer.next({url: url, fileName: `${randomString}_${file.name}`});
          observer.complete();
        });
      }
    );
  });
}

generateRandomString(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

}
