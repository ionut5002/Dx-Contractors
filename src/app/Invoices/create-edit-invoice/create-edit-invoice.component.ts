import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../invoice.service';
import { ClientService } from 'src/app/Clients/client.service';
import { Client } from 'src/app/Clients/client';
import { Invoice } from '../invoice.model';
import { PDFGeneratorService } from 'src/app/Extras/pdf-generator.service';
import { SharedService } from 'src/app/Extras/shared.service';

@Component({
  selector: 'app-create-edit-invoice',
  templateUrl: './create-edit-invoice.component.html',
  styleUrls: ['./create-edit-invoice.component.scss']
})
export class CreateEditInvoiceComponent implements OnInit {
  invoiceForm!: FormGroup;
  isEditMode = false;
  clients: Client[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private pdfService: PDFGeneratorService,
    private sharedService: SharedService
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
        
      }

    }
  }

  ngOnInit(): void {
    this.sharedService.getClients().subscribe(clients => {
      this.clients = clients;
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
      Paid: [false]
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
}