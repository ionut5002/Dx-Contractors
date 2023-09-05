// view-clients.component.ts
import { Component, OnInit } from '@angular/core';
import { Client } from '../client';
import { ClientService } from '../client.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from 'src/app/Extras/confirmation-dialog/confirmation-dialog.component';
import { SharedService } from 'src/app/Extras/shared.service';
@Component({
    selector: 'app-view-clients',
    templateUrl: './view-clients.component.html'
})
export class ViewClientsComponent implements OnInit {
    clients: Client[] = [];

    constructor(private dialog: MatDialog, private router: Router, private clientService: ClientService, private sharedService: SharedService) {}

    ngOnInit() {
        this.sharedService.getClients().subscribe(data => {
            this.clients = data;
        });
    }

    editClient(clientId: string): void {
        this.router.navigate(['/edit-client', clientId]);
      }

      promptRemove(clientId: string): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.clientService.deleteClient(clientId);
            // Refresh your clients list or remove the client from the list
          }
        });
      }
}
