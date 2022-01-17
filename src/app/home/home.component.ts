import { elementEventFullName } from '@angular/compiler/src/view_compiler/view_compiler';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import _ from "lodash";
import { ViewInvoiceComponent } from '../view-invoice/view-invoice.component';
import { SharedService } from '../shared.service';
import * as moment from 'moment';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {


   cartProductList:any= [];
   selectedProduct:any=[];
   ServiceList: any = [];
   invoiceObject:any= [];
   public taxRate= 5;
   public subTotal:number;
   public total:number;
   public other:number;
   public taxable:number;
   public taxDue: number;
   public loading:boolean;

  //  user Details
  public companyName;
  public firstname;
  public lastname;
  public address;
  public city;
  public state;
  public postalCode;
  public contact;
  customerId: number;

  // view invoice button
  public viewButton:boolean = false;

  constructor(public dialog: MatDialog, private service:SharedService) { }

  ngOnInit() {
    this.loading = true;
    this.getService();
  }

  // retrieve all services available from the DB
  getService(){
    this.service.getServices().subscribe( data =>{
      this.ServiceList = data.Result;
      this.loading = false;
    });
  }

  // add products to cart
  addProduct(item:any){
    try{
       let flag = false;
       this.cartProductList.forEach(el => {
         if(el.ServiceDescription === item.ServiceDescription){
           el.Qty +=1;
           flag = true;
           return false;
         }
       });
       if(!flag){
          this.cartProductList.push(item)
       }

       this.cartProductList.forEach(el =>{
         el.TotalPrice = el.Price * el.Qty;
       })

       this.calc(this.cartProductList)

    }catch(error){
      console.log(error)
    }
  }
// delete product
  deleteProduct(item:any, index){
    try{
      this.cartProductList.forEach(el =>{
        if(el.ServiceDescription === item.ServiceDescription){
          el.Qty -=1;
          el.TotalPrice = el.Price * el.Qty;
        }
      });
      this.cartProductList = _.reject(this.cartProductList,  o => o.Qty === 0);
      this.ServiceList.forEach(el =>{
        if(el.Qty == 0){
          el.Qty = 1;
        }
      });
      this.calc(this.cartProductList)

    }catch(error){
      console.log(error)
    }
  }

  // function that calculates subtotal, tax due and total
  calc(cardList:any){
    try{
      this.total = 0;
      this.taxable = 0;
      this.subTotal = 0;
      this.taxDue = 0;
      this.other = 0;
      //  taxable total
      for(let x = 0; x  < cardList.length; x++){
        if(cardList[x].Taxed === "tax"){
             this.taxable += cardList[x].TotalPrice;
        }
      }

      // subtotal
      for(let x = 0; x  < cardList.length; x++){
        this.subTotal += cardList[x].TotalPrice;
      }

      //taxDue
      this.taxDue = (this.taxRate * this.taxable) / 100;

      //Total
      this.total = this.subTotal + this.taxDue + this.other;

    }catch(error){
      console.log(error)
    }

  }

  // insert to DB
  buy(){
    try{
      let body;
      var customerId = Math.floor(Math.random() * 1000000000);
      this.cartProductList.forEach(el =>{
        el.CustomerId = customerId.toString();

      });

      var now  =  new Date();
      var dateString = moment(now).format('YYYY-MM-DD');
      var myDate = moment(dateString).add(1,'M');
      var futureDate = moment(myDate).format('YYYY-MM-DD');

      body = {
        "IssuedDate": dateString.toString(),
        "DueDate": futureDate.toString(),
        "CustomerId": customerId.toString(),
        "CustomerFirstName": this.firstname,
        "CustomerLastName": this.lastname,
        "CompanyName": this.companyName,
        "StreetName": this.address,
        "StreetNumber": "none",
        "CityName": this.city,
        "ZipCode": this.postalCode,
        "SuburbName": "none",
        "PhoneNumber": this.contact,
        "AllPurchases": this.cartProductList
      }


      if(this.firstname && this.lastname && this.address && this.city && this.postalCode && this.companyName && this.contact && this.state){
        // insert client details and services to the DB
        this.service.addInvoices(body).subscribe(res =>{

          this.viewButton = true;
          // reset values
          this.cartProductList = [];
          this.firstname = "";
          this.lastname = "";
          this.address = "";
          this.city = "";
          this.postalCode = "";
          this.companyName = "";
          this.contact = "";
          this.state = "";

          // ----- removing null values
          type structure = any[]|any;
          const myRes:structure = res;
          this.invoiceObject = myRes.map(obj =>
            Object.keys(obj).filter(e => obj[e] !== null).reduce((o, e) =>{o[e] = obj[e]; return o;},{})
          )
        });
      }


    }catch(error){
       console.log(error)
    }
  }


  viewInvoice(){
    try{
      const dialog = this.dialog.open(ViewInvoiceComponent,{
        width: '800px',
        data:{TaxDue:this.taxDue, Taxable:this.taxable, TaxRate:this.taxRate, SubTotal:this.subTotal, Total:this.total, InvoiceDetails:this.invoiceObject}
      });

    }catch(error){
      console.log(error)
    }
  }

}
