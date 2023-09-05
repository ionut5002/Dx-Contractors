import { Injectable } from '@angular/core';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { updateDoc, getDoc, setDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  constructor(private firestore: Firestore) {}

  getStockItems(): Observable<any> {
    return docData(doc(this.firestore, 'stock', 'stockItems'));
  }

  updateStockItems(stockData: any[]): Promise<void> {
    const stockDoc = doc(this.firestore, 'stock', 'stockItems');
    return setDoc(stockDoc, { Items: stockData });
  }
}
