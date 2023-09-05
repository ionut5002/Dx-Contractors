// view-quotations.component.ts
import { Component, OnInit } from '@angular/core';
import { QuotationService } from '../quotation.service';
import { Quotation } from '../quotation.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/Extras/confirmation-dialog/confirmation-dialog.component';
import { PDFGeneratorService } from 'src/app/Extras/pdf-generator.service';
import { SharedService } from 'src/app/Extras/shared.service';
import { EmailService } from 'src/app/Extras/email.service';

@Component({
    selector: 'app-view-quotations',
    templateUrl: './view-quotations.component.html',
    styleUrls: ['./view-quotations.component.scss']
})
export class ViewQuotationsComponent implements OnInit {
    quotations: Quotation[] = [];

    constructor(private quotationService: QuotationService, 
        private router: Router, 
        private dialog: MatDialog, 
        private pdfService: PDFGeneratorService, 
        private sharedService: SharedService, 
        private emailService: EmailService) { }

    ngOnInit(): void {
        this.sharedService.getQuotations().subscribe(data => {
            this.quotations = data;
        });
    }

    editQuotation(quotation: Quotation): void {
        this.router.navigate(['/edit-quotation', quotation.id], { state: { data: quotation } });
    }

    async deleteQuotation(id: string): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent);

        dialogRef.afterClosed().subscribe(async result => {
            if (result === true) {
                await this.quotationService.deleteQuotation(id);
            }
        });
    }

    createJobFromQuotation(quotation: Quotation): void {
        this.router.navigate(['/create-job'], { state: { data: { location: quotation.location, quotationId: quotation.id, client: quotation.client, materials: quotation.materials, quotationNo: quotation.quotationNo } } });
    }

    viewJobFromQuotation(quotation: Quotation): void {
        this.router.navigate(['/edit-job', quotation.jobId], { state: { data: { id: quotation.jobId }, type: "Quote" } });
    }

    generatePDFfromQuotation(quotation: Quotation): void {
        this.pdfService.generateQuotationPdf(quotation)
    }


    async onDeletePdf(quotation: Quotation): Promise<void> {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent);
        dialogRef.afterClosed().subscribe(async result => {
            if (result === true) {
                try {
                    await this.pdfService.removeQuotationPdf(quotation);
                    // Optionally, update the local quotation object to reflect the changes
                    quotation.PDF = false;
                    quotation.PDFUrl = '';
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
      calculateTotalMaterialsAmount(quotation: Quotation): number {
        if (quotation && quotation.materials) {
          return quotation.materials.reduce((total, material) => total + (material.price*material.quantity), 0);
        }
        return 0;
      }


      sendEmailforQuotation(quotation: Quotation): void {
        this.emailService.sendQuotationEmail(quotation).subscribe(res =>{
            quotation.Sent = true
            this.quotationService.ChangeFieldtoQuotation(quotation.id, quotation)
        })
    }

    resendEmailforQuotation(quotation: Quotation): void {
        this.emailService.resendQuotationEmail(quotation).subscribe(res =>{
        })
    }
}
