import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, setDoc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Invoice } from './invoice.model';
import { JobService } from '../Jobs/job.service';

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {
    private invoiceCollection: any;

    constructor(private firestore: Firestore, private jobService: JobService) {
        this.invoiceCollection = collection(this.firestore, 'invoices');
    }

    getInvoices(): Observable<Invoice[]> {
        return collectionData(this.invoiceCollection, { idField: 'id' }) as Observable<Invoice[]>;
    }

    async addInvoice(invoice: Invoice): Promise<any> {
        const invoiceDoc = doc(this.invoiceCollection);
        const invoiceId = invoiceDoc.id;
        invoice.id = invoiceId;
    
        // Add the invoice to Firestore
        await setDoc(invoiceDoc, invoice);
    
       if (invoice.jobId) {
         // Update the job's invoices list
         const jobDoc = doc(this.firestore, 'jobs', invoice.jobId);
         const jobSnapshot = await getDoc(jobDoc);
         if (jobSnapshot.exists()) {
             const jobData = jobSnapshot.data();
             const updatedInvoices = jobData ? jobData['invoices'] : [];
             updatedInvoices.push({
                 id: invoiceId,
                 url: invoice.PDFUrl,
                 amount: invoice.totalExclVAT,
                 sent: invoice.Sent,
                 paid: invoice.Paid,

             });
             await updateDoc(jobDoc, { invoices: updatedInvoices, invoiced: invoice.type });
         }
       }
    }
    
    async updateInvoice(invoiceId: string, invoice: Invoice): Promise<any> {
        // Update the invoice in Firestore
        await updateDoc(doc(this.firestore, 'invoices', invoiceId), { ...invoice });
    
        if (invoice.jobId) {
            // Update the job's invoices list
        const jobDoc = doc(this.firestore, 'jobs', invoice.jobId);
        const jobSnapshot = await getDoc(jobDoc);
        if (jobSnapshot.exists()) {
            const jobData = jobSnapshot.data();
            const updatedInvoices = jobData['invoices'].map((inv: any) => {
                if (inv.id === invoiceId) {
                    return {
                        id: invoiceId,
                        url: invoice.PDFUrl,
                        amount: invoice.totalExclVAT,
                        sent: invoice.Sent,
                        paid: invoice.Paid,
                    };
                }
                return inv;
            });
            await updateDoc(jobDoc, { invoices: updatedInvoices, invoiced: invoice.type });
        }
        }
    }
    

    ChangeFieldtoInvoice(invoiceId: string, invoice: any): Promise<any> {
      return updateDoc(doc(this.firestore, 'invoices', invoiceId), { ...invoice });
  }

  async deleteInvoice(invoice: Invoice): Promise<any> {
    if (invoice.jobId) {
        // 1. Fetch the job associated with the invoice
    const jobId = invoice.jobId;
    const jobDocRef = doc(this.firestore, 'jobs', jobId);
    const jobSnapshot = await getDoc(jobDocRef);
    const jobData = jobSnapshot.data();

    if (jobData) {
        // 2. Update the job's invoices array to remove the invoice with the given invoiceId
        const updatedInvoices = jobData['invoices'].filter((inv: any) => inv.id !== invoice.id);
        await updateDoc(jobDocRef, { invoices: updatedInvoices });
    }
    }

    // 3. Delete the invoice from the invoices collection
    return deleteDoc(doc(this.firestore, 'invoices', invoice.id));
}

}
