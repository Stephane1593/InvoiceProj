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

  // retrieve all services
  getService(){
    this.service.getServices().subscribe( data =>{
      this.ServiceList = data.Result;
      this.loading = false;
      console.log("Data: ", this.ServiceList )
    });
  }

  addProduct(item:any){
    try{
       console.log("product: ", item)
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

       console.log("productList: ", this.cartProductList)
       this.calc(this.cartProductList)

    }catch(error){
        
    }
  }

  deleteProduct(item:any, index){
    try{
      console.log("item: ", item)
        console.log("index: ", index)
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
      console.log("productList: ", this.cartProductList)
      this.calc(this.cartProductList)

    }catch(error){

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
      console.log("cardList ", cardList)
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


      console.log("taxable:", this.taxable)
      console.log("subtotal:", this.subTotal)
      console.log("taxDue:", this.taxDue)
      console.log("total: ", this.total)
    }catch(error){

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

      console.log("client: ",body)
      if(this.firstname && this.lastname && this.address && this.city && this.postalCode && this.companyName && this.contact && this.state){
        this.service.addInvoices(body).subscribe(res =>{
          console.log("response: ", res)
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
          console.log("finalResp: ", this.invoiceObject)
             
        });
      }


    }catch(error){

    }
  }


  viewInvoice(){
    try{
      const dialog = this.dialog.open(ViewInvoiceComponent,{
        width: '800px',
        data:{TaxDue:this.taxDue, Taxable:this.taxable, TaxRate:this.taxRate, SubTotal:this.subTotal, Total:this.total, InvoiceDetails:this.invoiceObject}
      });

    }catch(error){

    }
  }

}
