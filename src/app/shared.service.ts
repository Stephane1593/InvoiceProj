import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from  'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  readonly APIUrl = "http://localhost:51601/api";


  constructor(private http:HttpClient) { }

  // retrieve all invoice details
  getInvoices():Observable<any[]>{
    return this.http.get<any>(this.APIUrl+'/Invoice');
  }

  // retrieve all services
  getServices():Observable<any>{
    return this.http.get<any>(this.APIUrl+'/Service');
  }

  // create invoice
  addInvoices(body:any){
    return this.http.post(this.APIUrl+'/Invoice', body);
  }
}
