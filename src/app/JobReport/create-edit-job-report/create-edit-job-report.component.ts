import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from 'src/app/Clients/client.service';
import { Client } from 'src/app/Clients/client';
import { PDFGeneratorService } from 'src/app/Extras/pdf-generator.service';
import { JobReport } from '../job-report.model';
import { JobReportService } from '../job-report.service';
import { SharedService } from 'src/app/Extras/shared.service';
import { Timestamp } from 'firebase/firestore';
import { MatDialog } from '@angular/material/dialog';
import { FilesUploadComponent } from 'src/app/Extras/files-upload/files-upload.component';
import { ConfirmationDialogComponent } from 'src/app/Extras/confirmation-dialog/confirmation-dialog.component';
import { FilesService } from 'src/app/Extras/files.service';

@Component({
  selector: 'app-create-edit-job-report',
  templateUrl: './create-edit-job-report.component.html',
  styleUrls: ['./create-edit-job-report.component.scss']
})
export class CreateEditJobReportComponent {
  jobReportForm!: FormGroup;
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
    private jobReportService: JobReportService,
    private clientService: ClientService,
    private pdfService: PDFGeneratorService,
    private sharedService: SharedService,
    public dialog: MatDialog,
    private filesService: FilesService
  ) {
    this.initializeForm();
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { data: JobReport, type: string };

    if (state) {
      if (state.type == "JobReport") {
        const jobReport = state.data;
        this.isEditMode = true;
        if (jobReport.PDF) {
          jobReport.PDFUrl = '';
          jobReport.PDF = false;
          jobReport.Sent = false;
          this.pdfService.removeJobReportPdf(jobReport)
        }
        this.jobReportForm.patchValue({
          ...jobReport,
          date: new Date((jobReport.date as any).seconds * 1000),
          client: jobReport.client.contact.deptName
        });
        this.files = jobReport.files
        jobReport.Items.forEach(item => {
          const itemGroup = this.fb.group(item);
          this.items.push(itemGroup);
          itemGroup.valueChanges.subscribe(() => {
            this.computeTotals();
          });
        });

        this.computeTotals();

      } else {
        const jobReport = state.data;
        this.jobReportForm.patchValue({
          ...jobReport,
          client: jobReport.client.contact.deptName,
          location: jobReport.location,
          orderNumber: jobReport.orderNumber,
          vendorNumber: jobReport.orderNumber,
          jobId: jobReport.jobId
        });
        this.files = jobReport.files

      }

    }
  }

  ngOnInit(): void {
    this.sharedService.getClients().subscribe(clients => {
      this.clients = clients;
    });
    this.sharedService.getUser().subscribe((user: any) => {
      if (user) {
        this.jobReportForm.patchValue({
          CreatedBy: user[0].displayName,
          CreatedDate: Timestamp.now()

        });
      }
    });
  }

  initializeForm(): void {
    this.jobReportForm = this.fb.group({
      client: ['', Validators.required],
      location: ['', Validators.required],
      jobReportNo: ['', Validators.required],
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
      CreatedBy: [''],
      CreatedDate: [''],
      files: []
    });
  }

  get items(): FormArray {
    return this.jobReportForm.get('Items') as FormArray;
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
    this.jobReportForm.get('totalExclVAT')?.setValue(totalExclVAT);
    const totalInclVAT = totalExclVAT + (totalExclVAT * 0.135);
    this.jobReportForm.get('totalInclVAT')?.setValue(totalInclVAT);
  }

  async saveJobReport(): Promise<void> {
    for (let client of this.clients) {
      for (let contact of client.contacts) {
        if (contact.deptName === this.jobReportForm.get('client')?.value) {
          this.jobReportForm.patchValue({
            client: { name: client.name, type: client.type, contact: contact }
          });
        }
      }
    }
    this.jobReportForm.patchValue({
      files: this.files
    });
    if (this.isEditMode) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        await this.jobReportService.updateJobReport(id, this.jobReportForm.value);
      }
    } else {
      await this.jobReportService.addJobReport(this.jobReportForm.value);

    }
    this.router.navigate(['/view-job-reports']);
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
