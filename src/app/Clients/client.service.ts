import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Client } from './client';

@Injectable({
    providedIn: 'root'
})
export class ClientService {
    private clientCollection: any;

    constructor(private firestore: Firestore) {
        this.clientCollection = collection(this.firestore, 'clients');
    }

    getClients(): Observable<Client[]> {
        return collectionData(this.clientCollection, { idField: 'id' }) as Observable<Client[]>;
    }

    addClient(client: Client): Promise<any> {
        return addDoc(this.clientCollection, client);
    }

    updateClient(clientId: string, client: Client): Promise<any> {
        return updateDoc(doc(this.firestore, 'clients', clientId), { ...client });
    }

    deleteClient(clientId: string): Promise<any> {
        return deleteDoc(doc(this.firestore, 'clients', clientId));
    }
}
