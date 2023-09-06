import { Component, OnInit } from '@angular/core';
import { InvoiceService } from '../invoice.service';
import { Invoice } from '../invoice.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/Extras/confirmation-dialog/confirmation-dialog.component';
import { PDFGeneratorService } from 'src/app/Extras/pdf-generator.service';
import { JobService } from 'src/app/Jobs/job.service';
import { SharedService } from 'src/app/Extras/shared.service';
import { EmailService } from 'src/app/Extras/email.service';
import { Client } from 'src/app/Clients/client';

@Component({
    selector: 'app-view-invoices',
    templateUrl: './view-invoices.component.html',
    styleUrls: ['./view-invoices.component.scss']
})
export class ViewInvoicesComponent implements OnInit {
    invoices: Invoice[] = [];
    locationFilter: string = '';
    selectedClientName?: string;
    isCommercial: boolean = true;
    clients: Client[] = []

    constructor(private invoiceService: InvoiceService,
        private router: Router,
        private dialog: MatDialog,
        private pdfService: PDFGeneratorService,
        private sharedService: SharedService,
        private emailService: EmailService) { }

    ngOnInit(): void {
        this.sharedService.getInvoices().subscribe(data => {
            this.invoices = data;
        });
        this.sharedService.getClients().subscribe(data => {
            this.clients = data
        })
    }

    editInvoice(invoice: Invoice): void {
        this.router.navigate(['/edit-invoice', invoice.id], { state: { data: invoice, type: "Invoice" } });
    }

    async deleteInvoice(invoice: Invoice): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent);
        dialogRef.afterClosed().subscribe(async result => {
            if (result === true) {
                await this.pdfService.removeInvoicePdf(invoice);
                await this.invoiceService.deleteInvoice(invoice);

            }
        });
    }

    generatePDFfromInvoice(invoice: Invoice): void {
        this.pdfService.generateInvoicePdf(invoice);
    }

    async onDeletePdf(invoice: Invoice): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent);
        dialogRef.afterClosed().subscribe(async result => {
            if (result === true) {
                try {
                    await this.pdfService.removeInvoicePdf(invoice);
                    invoice.PDF = false;
                    invoice.PDFUrl = '';
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

    sendEmailforInvoice(invoice: Invoice): void {
        this.emailService.sendInvoiceEmail(invoice).subscribe(res => {
            invoice.Sent = true
            this.invoiceService.updateInvoice(invoice.id, invoice)
        })
    }

    resendEmailforInvoice(invoice: Invoice): void {
        this.emailService.resendInvoiceEmail(invoice).subscribe(res => {
        })
    }

    filterInvoices(invoice: Invoice) {
        let locationMatch = true;
        let clientNameMatch = true;
        let clientTypeMatch = true;

        if (this.locationFilter) {
            locationMatch = invoice.location.includes(this.locationFilter);
        }

        if (this.selectedClientName) {
            clientNameMatch = invoice.client.name === this.selectedClientName;
        }

        if (this.isCommercial !== null) {
            clientTypeMatch = this.isCommercial ? invoice.client.type === 'Commercial' : invoice.client.type === 'Private';
        }

        return locationMatch && clientNameMatch && clientTypeMatch;
    }
}
