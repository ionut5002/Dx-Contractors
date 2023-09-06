import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/Extras/confirmation-dialog/confirmation-dialog.component';
import { PDFGeneratorService } from 'src/app/Extras/pdf-generator.service';
import { JobService } from 'src/app/Jobs/job.service';
import { JobReportService } from '../job-report.service';
import { JobReport } from '../job-report.model';
import { SharedService } from 'src/app/Extras/shared.service';
import { EmailService } from 'src/app/Extras/email.service';
import { Client } from 'src/app/Clients/client';

@Component({
    selector: 'app-view-job-report',
    templateUrl: './view-job-report.component.html',
    styleUrls: ['./view-job-report.component.scss']
})
export class ViewJobReportComponent {
    jobReports: JobReport[] = [];
    locationFilter: string = '';
    selectedClientName?: string;
    isCommercial: boolean = true;
    clients: Client[] = []

    constructor(private jobReportService: JobReportService,
        private router: Router,
        private dialog: MatDialog,
        private pdfService: PDFGeneratorService,
        private sharedService: SharedService,
        private emailService: EmailService) { }

    ngOnInit(): void {
        this.sharedService.getJobReports().subscribe(data => {
            this.jobReports = data;
        });
        this.sharedService.getClients().subscribe(data => {
            this.clients = data
        })
    }

    editJobReport(jobReport: JobReport): void {
        this.router.navigate(['/edit-job-report', jobReport.id], { state: { data: jobReport, type: "JobReport" } });
    }

    async deleteJobReport(jobReport: JobReport): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent);
        dialogRef.afterClosed().subscribe(async result => {
            if (result === true) {
                await this.pdfService.removeJobReportPdf(jobReport);
                await this.jobReportService.deleteJobReport(jobReport);

            }
        });
    }

    generatePDFfromJobReport(jobReport: JobReport): void {
        this.pdfService.generateJobReportPdf(jobReport);
    }

    async onDeletePdf(jobReport: JobReport): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent);
        dialogRef.afterClosed().subscribe(async result => {
            if (result === true) {
                try {
                    await this.pdfService.removeJobReportPdf(jobReport);
                    jobReport.PDF = false;
                    jobReport.PDFUrl = '';
                    console.log('PDF removed successfully!');
                } catch (error) {
                    console.error('Error removing PDF:', error);
                }
            }
        });
    }

    convertTimestampToDate(timestamp: any): string {
        return new Date(timestamp.seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    sendEmailforJobReport(jobReport: JobReport): void {
        this.emailService.sendJobReportEmail(jobReport).subscribe(res => {
            jobReport.Sent = true
            this.jobReportService.updateJobReport(jobReport.id, jobReport)
        })
    }

    resendEmailforJobReport(jobReport: JobReport): void {
        this.emailService.resendJobReportEmail(jobReport).subscribe(res => {
        })
    }

    filterJobReports(jobReport: JobReport) {
        let locationMatch = true;
        let clientNameMatch = true;
        let clientTypeMatch = true;

        if (this.locationFilter) {
            locationMatch = jobReport.location.includes(this.locationFilter);
        }

        if (this.selectedClientName) {
            clientNameMatch = jobReport.client.name === this.selectedClientName;
        }

        if (this.isCommercial !== null) {
            clientTypeMatch = this.isCommercial ? jobReport.client.type === 'Commercial' : jobReport.client.type === 'Private';
        }

        return locationMatch && clientNameMatch && clientTypeMatch;
    }
}
