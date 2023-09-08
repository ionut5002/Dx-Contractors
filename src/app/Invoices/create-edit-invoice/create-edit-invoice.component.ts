import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../invoice.service';
import { Client } from 'src/app/Clients/client';
import { Invoice } from '../invoice.model';
import { PDFGeneratorService } from 'src/app/Extras/pdf-generator.service';
import { SharedService } from 'src/app/Extras/shared.service';
import { Timestamp } from 'firebase/firestore';
import { FilesService } from 'src/app/Extras/files.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/Extras/confirmation-dialog/confirmation-dialog.component';
import { FilesUploadComponent } from 'src/app/Extras/files-upload/files-upload.component';

@Component({
  selector: 'app-create-edit-invoice',
  templateUrl: './create-edit-invoice.component.html',
  styleUrls: ['./create-edit-invoice.component.scss']
})
export class CreateEditInvoiceComponent implements OnInit {
  invoiceForm!: FormGroup;
  isEditMode = false;
  clients: Client[] = [];
  files: Array<{
    fileName: string;
    fileURL: string
  }> = []

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private pdfService: PDFGeneratorService,
    private sharedService: SharedService,
    public dialog: MatDialog,
    private filesService: FilesService
  ) {
    this.initializeForm();
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { data: Invoice, type: string };

    if (state) {
      if (state.type == "Invoice") {
        const invoice = state.data;
        this.isEditMode = true;
        if (invoice.PDF) {
          invoice.PDFUrl = '';
        invoice.PDF = false;
        invoice.Sent = false;
        this.pdfService.removeInvoicePdf(invoice)
        }
        this.invoiceForm.patchValue({
          ...invoice,
          date: new Date((invoice.date as any).seconds * 1000),
          client: invoice.client.contact.deptName
        });
        this.files = invoice.files
        invoice.Items.forEach(item => {
          const itemGroup = this.fb.group(item);
          this.items.push(itemGroup);
          itemGroup.valueChanges.subscribe(() => {
            this.computeTotals();
        });
        });
        
        this.computeTotals();
        
      } else {
        const invoice = state.data;
        this.invoiceForm.patchValue({
          ...invoice,
          client: invoice.client.contact.deptName,
          location: invoice.location,
          orderNumber: invoice.orderNumber,
          vendorNumber: invoice.orderNumber,
          jobId: invoice.jobId
        });
        this.files = invoice.files
      }

    }
  }

  ngOnInit(): void {
    this.sharedService.getClients().subscribe(clients => {
      this.clients = clients;
    });
    this.sharedService.getUser().subscribe((user: any) => {
      if (user) {
        this.invoiceForm.patchValue({
          CreatedBy: user[0].displayName,
          CreatedDate: Timestamp.now()
          
        });
      }
    });
  }

  initializeForm(): void {
    this.invoiceForm = this.fb.group({
      client: ['', Validators.required],
      location: ['', Validators.required],
      invoiceNo: ['', Validators.required],
      date: ['', Validators.required],
      Items: this.fb.array([]),
      totalExclVAT: ['', Validators.required],
      totalInclVAT: ['', Validators.required],
      jobId: [''],
      PDF: [false],
      Sent: [false],
      PDFUrl: [''],
      orderNumber: [''],
      vendorNumber: [''],
      type: ['', Validators.required],
      Paid: [false],
      CreatedBy: [''],
      CreatedDate: [''],
      files: []
    });
  }

  get items(): FormArray {
    return this.invoiceForm.get('Items') as FormArray;
  }

  addItem(): void {
    const itemGroup = this.fb.group({
      Item: ['', Validators.required],
      description: ['', Validators.required],
      quantity: [0, Validators.required],
      price: [0, Validators.required]
    });
    this.items.push(itemGroup);
    itemGroup.valueChanges.subscribe(() => {
      this.computeTotals();
    });
    this.computeTotals();
  }

  computeTotals(): void {
    const totalExclVAT = this.items.controls.reduce((acc, itemGroup) => {
      const quantity = itemGroup.get('quantity')?.value || 0;
      const price = itemGroup.get('price')?.value || 0;
      return acc + (quantity * price);
    }, 0);
    this.invoiceForm.get('totalExclVAT')?.setValue(totalExclVAT);
    const totalInclVAT = totalExclVAT + (totalExclVAT * 0.135);
    this.invoiceForm.get('totalInclVAT')?.setValue(totalInclVAT);
  }

  async saveInvoice(): Promise<void> {
    for (let client of this.clients) {
      for (let contact of client.contacts) {
        if (contact.deptName === this.invoiceForm.get('client')?.value) {
          this.invoiceForm.patchValue({
            client: { name: client.name, type: client.type, contact: contact }
          });
        }
      }
    }
    if (this.isEditMode) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        await this.invoiceService.updateInvoice(id, this.invoiceForm.value);
      }
    } else {
      await this.invoiceService.addInvoice(this.invoiceForm.value);

    }
    this.router.navigate(['/view-invoices']);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    this.computeTotals();
  }

  openUploadDialog(): void {
    const dialogRef = this.dialog.open(FilesUploadComponent, {
      data: { type: 'JobReportFiles' }
    });

    dialogRef.afterClosed().subscribe(result => {
      result.forEach((element: any) => {
        this.files.push(element)
      });
    });
  }

  async onDeletePdf(fileName: string, type: 'JobReportFiles'): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.afterClosed().subscribe(async result => {
      if (result === true) {
        try {
          await this.filesService.removeFile(fileName, type);
          const index = this.files.findIndex(file => file.fileName === fileName);
          if (index > -1) {
            this.files.splice(index, 1);
          }
          console.log('File removed successfully');
        } catch (error) {
          console.error('Error removing file:', error);
        }
      }
    });
  }

  
}
