import { Component, OnInit } from '@angular/core';
import { StockService } from './stock.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit {
  stockItems: { item: string, quantity: number }[] = [];

  constructor(private stockService: StockService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.stockService.getStockItems().subscribe(data => {
      this.stockItems = data.Items || [];
    });
  }

  updateStock(): void {
    this.stockService.updateStockItems(this.stockItems).then(() => {
      this.snackBar.open('Stock updated successfully', '', {
        duration: 3000,
      });
    }, () => {
      this.snackBar.open('Failed to update stock', '', {
        duration: 3000,
      });
    });
  }

  addItem(): void {
    this.stockItems.push({ item: '', quantity: 0 });
  }

  removeItem(index: number): void {
    this.stockItems.splice(index, 1);
    this.updateStock();
  }
}
