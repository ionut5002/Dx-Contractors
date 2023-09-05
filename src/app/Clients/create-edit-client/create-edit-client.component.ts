import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, setDoc, collection } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Client } from '../client';

@Component({
  selector: 'app-create-edit-client',
  templateUrl: './create-edit-client.component.html',
  styleUrls: ['./create-edit-client.component.scss']
})
export class CreateEditClientComponent implements OnInit {
  clientForm: FormGroup;
  isEditMode = false;
  clientId?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore,
    private fb: FormBuilder
  ) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      type: ['private', Validators.required],
      contacts: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.clientId) {
      this.isEditMode = true;
      this.loadClientData();
    }
  }

  async loadClientData(): Promise<void> {
    const clientDoc = doc(this.firestore, 'clients', this.clientId!);
    const clientSnapshot = await getDoc(clientDoc);
    if (clientSnapshot.exists()) {
      const client = clientSnapshot.data() as Client;
      this.clientForm.patchValue({
        name: client.name,
        type: client.type
      });
      client.contacts.forEach(contact => {
        this.contacts.push(this.createContactGroup(contact));
      });
    }
  }

  get contacts(): FormArray {
    return this.clientForm.get('contacts') as FormArray;
  }

  createContactGroup(contact?: { deptName: string, contactName: string, email: string, phone: string }): FormGroup {
    return this.fb.group({
      deptName: [contact?.deptName || '', Validators.required],
      contactName: [contact?.contactName || '', Validators.required],
      email: [contact?.email || '', [Validators.required, Validators.email]],
      phone: [contact?.phone || '', Validators.required]
    });
  }

  addContact(): void {
    this.contacts.push(this.createContactGroup());
  }

  removeContact(index: number): void {
    this.contacts.removeAt(index);
  }

  generateFirestoreId(): string {
    return doc(collection(this.firestore, '_')).id;
  }

  async saveClient(): Promise<void> {
    if (this.clientForm.valid) {
      const clientData = this.clientForm.value as Client;
      if (this.isEditMode && this.clientId) {
        const clientDoc = doc(this.firestore, 'clients', this.clientId);
        await setDoc(clientDoc, clientData);
      } else {
        const newId = this.generateFirestoreId();
        clientData.id = newId; // Assign the generated ID to the client object
        const clientDoc = doc(this.firestore, 'clients', newId);
        await setDoc(clientDoc, clientData);
      }
      this.router.navigate(['/view-clients']);
    }
  }
}
