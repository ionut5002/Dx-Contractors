import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, setDoc, docData, orderBy, limit, query } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Job } from './job.model';
import { QuotationService } from '../Quotations/quotation.service';
import { getDoc } from 'firebase/firestore';

@Injectable({
    providedIn: 'root'
})
export class JobService {
    private jobCollection: any;

    constructor(private firestore: Firestore, private quotationService: QuotationService,) {
        this.jobCollection = collection(this.firestore, 'jobs');
    }

    getJobs(): Observable<Job[]> {
        const jobReportQuery = query(
            this.jobCollection,
            orderBy('startDate', 'desc'), // Order by Date field in ascending order
            limit(1000) // Limit to 1000 documents
          );
        return collectionData(jobReportQuery, { idField: 'id' }) as Observable<Job[]>;
    }

    async getJobById(jobId: string): Promise<Job | null> {
        const jobDocRef = doc(this.firestore, 'jobs', jobId);
        const jobSnapshot = await getDoc(jobDocRef);
        if (jobSnapshot.exists()) {
            return { id: jobSnapshot.id, ...jobSnapshot.data() } as Job;
        } else {
            return null;
        }
    }

    addJob(job: Job): Promise<any> {
        const jobDoc = doc(this.jobCollection);
        const jobId = jobDoc.id;
        job.id = jobId
        if (job.quotationId) {
            this.quotationService.ChangeFieldtoQuotation(job.quotationId, { jobId: jobId })
        }
        return setDoc(jobDoc, job);
    }

    updateJob(jobId: string, job: Job): Promise<any> {
        return updateDoc(doc(this.firestore, 'jobs', jobId), { ...job });
    }

    updateJobField(jobId: string, job: any): Promise<any> {
        return updateDoc(doc(this.firestore, 'jobs', jobId), { ...job });
    }

    deleteJob(job: Job): Promise<any> {
        if (job.quotationId) {
            this.quotationService.ChangeFieldtoQuotation(job.quotationId, { jobId: "" })
        }
        return deleteDoc(doc(this.firestore, 'jobs', job.id));
    }
}
