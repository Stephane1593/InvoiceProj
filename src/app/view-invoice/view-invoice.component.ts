import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-view-invoice',
  templateUrl: './view-invoice.component.html',
  styleUrls: ['./view-invoice.component.css']
})
export class ViewInvoiceComponent implements OnInit {
  invoiceDetails: any;
  subTotal: any;
  total: any;
  taxRate: any;
  taxDue: any;
  taxable: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data:any) { }

  ngOnInit() {
    this.invoiceDetails = this.data.InvoiceDetails;
    this.subTotal = this.data.SubTotal;
    this.total = this.data.Total;
    this.taxRate = this.data.TaxRate;
    this.taxDue = this.data.TaxDue;
    this.taxable = this.data.Taxable;

  }

}
