// quotation.service.ts
import { Injectable, Inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Quotation } from './quotation.model';

@Injectable({
    providedIn: 'root'
})
export class QuotationService {
    private quotationCollection: any;

    constructor( private firestore: Firestore ) {
        
        this.quotationCollection = collection(this.firestore, 'quotations');
    }

    getQuotations(): Observable<Quotation[]> {
        return collectionData(this.quotationCollection, { idField: 'id' }) as Observable<Quotation[]>;
    }

    addQuotation(quotation: Quotation): Promise<any> {
        const quotationDoc = doc(this.quotationCollection);
        const quotationId = quotationDoc.id;
        quotation.id = quotationId
        return setDoc(quotationDoc, quotation);
    }

    updateQuotation(quotationId: string, quotation: Quotation): Promise<any> {
      return updateDoc(doc(this.firestore, 'quotations', quotationId), { ...quotation });
  }

  ChangeFieldtoQuotation(quotationId: string, quotation: any): Promise<any> {
    return updateDoc(doc(this.firestore, 'quotations', quotationId), { ...quotation });
}

    deleteQuotation(quotationId: string): Promise<any> {
        return deleteDoc(doc(this.firestore, 'quotations', quotationId));
    }
}
