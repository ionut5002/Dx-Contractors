import { Component, OnInit } from '@angular/core';
import { JobService } from '../job.service';
import { Job } from '../job.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/Extras/confirmation-dialog/confirmation-dialog.component';
import { Timestamp } from 'firebase/firestore';
import { SharedService } from 'src/app/Extras/shared.service';
import { Client } from 'src/app/Clients/client';


@Component({
    selector: 'app-view-jobs',
    templateUrl: './view-jobs.component.html',
    styleUrls: ['./view-jobs.component.scss']
})
export class ViewJobsComponent implements OnInit {
    jobs: Job[] = [];
    locationFilter: string = '';
    selectedClientName?: string;
    isCommercial: boolean = true;
    clients: Client[] = []

    constructor(private jobService: JobService, private router: Router, private dialog: MatDialog, private sharedService: SharedService) { }

    ngOnInit(): void {
        this.sharedService.getJobs().subscribe(data => {
            this.jobs = data;
        });
        this.sharedService.getClients().subscribe(data => {
          this.clients = data
      })
    }

    editJob(job: Job): void {
        this.router.navigate(['/edit-job', job.id], { state: { data: job, type:"Job" } });
    }

    async deleteJob(job: Job): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    
        dialogRef.afterClosed().subscribe(async result => {
            if (result === true) {
                await this.jobService.deleteJob(job);
            }
        });
    }

    createInvoiceFromJob(job: Job): void {
        this.router.navigate(['/create-invoice'], { state: { data: { location: job.location, orderNumber: job.orderNumber, vendorNumber: job.vendorNumber, client: job.client, jobId: job.id }, type: "Job" } });
    }

    createJobReportFromJob(job: Job): void {
        this.router.navigate(['/create-job-report'], { state: { data: { location: job.location, orderNumber: job.orderNumber, vendorNumber: job.vendorNumber, client: job.client, jobId: job.id }, type: "Job" } });
    }

    convertTimestampToDate(timestamp: any): string {
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }

      isUpcomingJob(startDate: Date | Timestamp): boolean {
        const today = new Date();
        let start: Date;
      
        if (startDate instanceof Timestamp) {
          start = startDate.toDate();
        } else if (startDate instanceof Date) {
          start = startDate;
        } else {
          return false; // or throw an error
        }
      
        // Check if the start date is in the future
        return today < start;
      }
      
      // Function to check if a job is ongoing
      isOngoingJob(startDate: Date | Timestamp, endDate: Date | Timestamp): boolean {
        const today = new Date();
        let start: Date;
        let end: Date;
      
        if (startDate instanceof Timestamp) {
          start = startDate.toDate();
        } else if (startDate instanceof Date) {
          start = startDate;
        } else {
          return false; // or throw an error
        }
      
        if (endDate instanceof Timestamp) {
          end = endDate.toDate();
        } else if (endDate instanceof Date) {
          end = endDate;
        } else {
          return false; // or throw an error
        }
      
        // Check if today's date falls between the start and end dates
        return today >= start && today <= end;
      }
      
      // Function to check if a job is finished
      isFinishedJob(endDate: Date | Timestamp): boolean {
        const today = new Date();
        let end: Date;
      
        if (endDate instanceof Timestamp) {
          end = endDate.toDate();
        } else if (endDate instanceof Date) {
          end = endDate;
        } else {
          return false; // or throw an error
        }
      
        // Check if the end date is in the past
        return today > end;
      }
      calculateTotalInvoiceAmount(job: Job): number {
        if (job && job.invoices) {
          return job.invoices.reduce((total, invoice) => total + invoice.amount, 0);
        }
        return 0;
      }
      
      calculateTotalJobReportAmount(job: Job): number {
        if (job && job.jobReports) {
          return job.jobReports.reduce((total, report) => total + report.amount, 0);
        }
        return 0;
      }

      calculateTotalMaterialsAmount(job: Job): number {
        if (job && job.materials) {
          return job.materials.reduce((total, material) => total + (material.price*material.quantity), 0);
        }
        return 0;
      }

      filterJobs(job: Job) {
        let locationMatch = true;
        let clientNameMatch = true;
        let clientTypeMatch = true;
      
        if (this.locationFilter) {
          locationMatch = job.location.includes(this.locationFilter);
        }
      
        if (this.selectedClientName) {
          clientNameMatch = job.client.name === this.selectedClientName;
        }
      
        if (this.isCommercial !== null) {
          clientTypeMatch = this.isCommercial ? job.client.type === 'Commercial' : job.client.type === 'Private';
        }
      
        return locationMatch && clientNameMatch && clientTypeMatch;
      }

      
      
}
