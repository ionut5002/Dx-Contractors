import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../job.service';
import { Job } from '../job.model';
import { ClientService } from 'src/app/Clients/client.service';
import { Client } from 'src/app/Clients/client';
import { SharedService } from 'src/app/Extras/shared.service';

@Component({
    selector: 'app-create-edit-job',
    templateUrl: './create-edit-job.component.html',
    styleUrls: ['./create-edit-job.component.scss']
})
export class CreateEditJobComponent {
    jobForm: FormGroup;
    isEditMode = false;
    job: Job | null = null;
    clients: Client[] = [];

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private jobService: JobService,
        private clientService: ClientService,
        private sharedService: SharedService
    ) {
        this.jobForm = this.fb.group({
            location: ['', Validators.required],
            description: ['', Validators.required],
            client: ['', Validators.required],
            startDate: [null, Validators.required],
            endDate: [null, Validators.required],
            materials: this.fb.array([]),
            labour: this.fb.group({
                men: [null, Validators.required],
                rate: [null, Validators.required],
                total: [null]
              }),
            logistics: ['', Validators.required],
            mecanicalelectrical: ['', Validators.required],
            quotationId: [''],
            invoiced: ['No'],
            invoices: [[]],
            jobValue:['', Validators.required],
            orderNumber: [''],
            vendorNumber: [''],
            jobReports: [[]],
            quotationNo: ['N/A']
        });

        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras.state as { data: Job, type: string };
        if (state) {
            if (state.type == "Job") {
                this.job = state.data;
                this.isEditMode = true;
                this.jobForm.patchValue({
                    ...this.job,
                    location: this.job.location,
                    description: this.job.description,
                    startDate: this.job.startDate ? new Date((this.job.startDate as any).seconds * 1000)  : null,
                    endDate: this.job.endDate ? new Date((this.job.endDate as any).seconds * 1000) : null,
                    labour: this.job.labour,
                    logistics: this.job.logistics,
                    mecanicalelectrical: this.job.mecanicalelectrical,
                    quotationId: this.job.quotationId,
                    client: this.job.client.contact.deptName
                });
                if (this.job.materials) {
                  this.job.materials.forEach(material => {
                      this.materials.push(this.fb.group(material));
                      this.fb.group(material).valueChanges.subscribe(() => {
                        this.computeTotals();
                    });
                  });
              }  
            }
            else if (state.type == "Quote") {
                this.jobService.getJobById(state.data.id).then(job => {
            this.job = job
            if (this.job) {
                this.isEditMode = true;
            this.jobForm.patchValue({
                location: this.job.location,
                description: this.job.description,
                startDate: this.job.startDate ? new Date((this.job.startDate as any).seconds * 1000)  : null,
                endDate: this.job.endDate ? new Date((this.job.endDate as any).seconds * 1000) : null,
                labour: this.job.labour,
                logistics: this.job.logistics,
                mecanicalelectrical: this.job.mecanicalelectrical,
                quotationId: this.job.quotationId,
                client: this.job.client.contact.deptName,
                materials: this.job.materials,
                quotationNo: this.job.quotationNo
            });
            if (this.job.materials) {
              this.job.materials.forEach(material => {
                const materialGroup = this.fb.group(material);
                this.materials.push(materialGroup);
                materialGroup.valueChanges.subscribe(() => {
                    this.computeTotals();
                });
              });
          }  
            }
                });
                
            }
            else {
                this.job = state.data;
                this.jobForm.patchValue({
                    location: this.job.location,
                    quotationId: this.job.quotationId,
                    client: this.job.client.contact.deptName
                });
                if (this.job.materials) {
                  this.job.materials.forEach(material => {
                    const materialGroup = this.fb.group(material);
                    this.materials.push(materialGroup);
                    materialGroup.valueChanges.subscribe(() => {
                        this.computeTotals();
                    });
                  });
                  this.computeTotals();
              }
            }
            
        }
    }

    ngOnInit(): void {
        this.computeTotals();
        this.sharedService.getClients().subscribe(clients => {
            this.clients = clients;
        });

        this.jobForm.get('labour.men')!.valueChanges.subscribe(this.calculateTotal.bind(this));
  this.jobForm.get('labour.rate')!.valueChanges.subscribe(this.calculateTotal.bind(this));

    }

    get materials(): FormArray {
        return this.jobForm.get('materials') as FormArray;
    }

    addMaterial(): void {
        const materialGroup = this.fb.group({
            material: ['', Validators.required],
            quantity: ['', Validators.required],
            price: ['', Validators.required],
        });
        this.materials.push(materialGroup);
        materialGroup.valueChanges.subscribe(() => {
            this.computeTotals();
        });
    }

    async saveJob(): Promise<void> {
        for (let client of this.clients) {
            for (let contact of client.contacts) {
                if (contact.deptName === this.jobForm.get('client')?.value) {
                    this.jobForm.patchValue({
                        client: { name: client.name, type: client.type, contact: contact }
                    })
                    
                }
            }
        }
        if (this.isEditMode) {
            const jobId = this.route.snapshot.paramMap.get('id');
            if (jobId) {
                await this.jobService.updateJob(jobId, this.jobForm.value);
            }
        } else {
            await this.jobService.addJob(this.jobForm.value);
        }
        this.router.navigate(['/view-jobs']);
    }

    removeMaterial(index: number): void {
        this.materials.removeAt(index);
        this.computeTotals();
        
    }
    calculateTotal() {
        const men = this.jobForm.get('labour.men')!.value;
        const rate = this.jobForm.get('labour.rate')!.value;
      
        if (men && rate) {
          const total = men * rate;
          this.jobForm.get('labour.total')!.setValue(total);
          this.computeTotals()
        }
    }
    computeTotals(): void {
        const totalExclVAT = this.materials.controls.reduce((acc, materialGroup) => {
            const quantity = materialGroup.get('quantity')?.value || 0;
            const price = materialGroup.get('price')?.value || 0;
            return acc + (quantity * price);
        }, 0);
        this.jobForm.get('jobValue')?.setValue(totalExclVAT + this.jobForm.get('labour.total')!.value);
        
    }
}
