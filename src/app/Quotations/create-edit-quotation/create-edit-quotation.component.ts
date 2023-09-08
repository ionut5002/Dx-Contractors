import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuotationService } from '../quotation.service';
import { ClientService } from 'src/app/Clients/client.service';
import { Client } from 'src/app/Clients/client';
import { Quotation } from '../quotation.model';
import { SharedService } from 'src/app/Extras/shared.service';
import { Timestamp } from 'firebase/firestore';
import { MatDialog } from '@angular/material/dialog';
import { FilesService } from 'src/app/Extras/files.service';
import { ConfirmationDialogComponent } from 'src/app/Extras/confirmation-dialog/confirmation-dialog.component';
import { FilesUploadComponent } from 'src/app/Extras/files-upload/files-upload.component';

@Component({
    selector: 'app-create-edit-quotation',
    templateUrl: './create-edit-quotation.component.html',
    styleUrls: ['./create-edit-quotation.component.scss']
})
export class CreateEditQuotationComponent implements OnInit {
    quotationForm!: FormGroup;
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
        private quotationService: QuotationService,
        private clientService: ClientService,
        private sharedService: SharedService,
        public dialog: MatDialog,
        private filesService: FilesService
    ) {
        this.initializeForm();
        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras.state as { data: Quotation };

        if (state) {
            const quotation = state.data;
            this.isEditMode = true;
            this.quotationForm.patchValue({
                ...quotation,
                date: new Date((quotation.date as any).seconds * 1000),
                client: quotation.client.contact.deptName
            });
            quotation.descriptions.forEach(description => {
                this.descriptions.push(this.fb.group(description));
            });
            quotation.materials.forEach(material => {
                const materialGroup = this.fb.group(material);
                this.materials.push(materialGroup);
                materialGroup.valueChanges.subscribe(() => {
                    this.computeTotals();
                });
            });
            this.files = quotation.files
            this.computeTotals();
        }
    }

    ngOnInit(): void {
        this.sharedService.getClients().subscribe(clients => {
            this.clients = clients;
        });
        this.sharedService.getUser().subscribe((user: any) => {
            if (user) {
              this.quotationForm.patchValue({
                CreatedBy: user[0].displayName,
                CreatedDate: Timestamp.now()
                
              });
            }
          });
    }

    initializeForm(): void {
        this.quotationForm = this.fb.group({
            client: ['', Validators.required],
            location: ['', Validators.required],
            quotationNo: ['', Validators.required],
            date: ['', Validators.required],
            descriptions: this.fb.array([]),
            materials: this.fb.array([]),
            totalExclVAT: ['', Validators.required],
            totalInclVAT: ['', Validators.required],
            jobId: [''],
            PDF: [false],
            Sent: [false],
            PDFUrl: [''],
            CreatedBy: [''],
            CreatedDate: [''],
            files: []
        });
    }

    get descriptions(): FormArray {
        return this.quotationForm.get('descriptions') as FormArray;
    }

    addDescription(): void {
        const descriptionGroup = this.fb.group({
            title: ['', Validators.required],
            text: ['', Validators.required]
        });
        this.descriptions.push(descriptionGroup);
    }

    get materials(): FormArray {
        return this.quotationForm.get('materials') as FormArray;
    }

    addMaterial(): void {
        const materialGroup = this.fb.group({
            material: ['', Validators.required],
            quantity: [0, Validators.required],
            price: [0, Validators.required]
        });
        this.materials.push(materialGroup);
        materialGroup.valueChanges.subscribe(() => {
            this.computeTotals();
        });
        this.computeTotals();
    }

    computeTotals(): void {
        const totalExclVAT = this.materials.controls.reduce((acc, materialGroup) => {
            const quantity = materialGroup.get('quantity')?.value || 0;
            const price = materialGroup.get('price')?.value || 0;
            return acc + (quantity * price);
        }, 0);
        this.quotationForm.get('totalExclVAT')?.setValue(totalExclVAT);
        const totalInclVAT = totalExclVAT + (totalExclVAT * 0.135);
        this.quotationForm.get('totalInclVAT')?.setValue(totalInclVAT);
    }

    async saveQuotation(): Promise<void> {
        for (let client of this.clients) {
            for (let contact of client.contacts) {
                if (contact.deptName === this.quotationForm.get('client')?.value) {
                    this.quotationForm.patchValue({
                        client: { name: client.name, type: client.type, contact: contact }
                    });
                }
            }
        }
        if (this.isEditMode) {
            const id = this.route.snapshot.paramMap.get('id');
            if (id) {
                await this.quotationService.updateQuotation(id, this.quotationForm.value);
            }
        } else {
            await this.quotationService.addQuotation(this.quotationForm.value);
        }
        this.router.navigate(['/view-quotations']);
    }

    removeDescription(index: number): void {
        this.descriptions.removeAt(index);
    }

    removeMaterial(index: number): void {
        this.materials.removeAt(index);
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
