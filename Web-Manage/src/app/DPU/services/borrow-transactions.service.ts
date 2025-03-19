import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap, switchMap, filter, reduce } from "rxjs/operators";
import { BorrowTransactionsModel } from '../models/borrow-transactions';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class BorrowTransactionsService {

  apiBaseUrl = environment.baseUrl + "/borrow-transactions";
  constructor(
    private http: HttpClient
  ) { }

  getById(id: string) {
    return this.http
      .get<BorrowTransactionsModel>(this.apiBaseUrl + "/" + id)
      .pipe(map((e) => new BorrowTransactionsModel(e)));
  }

  getLists() {
    return this.http
      .get<BorrowTransactionsModel[]>(this.apiBaseUrl)
      .pipe(
        map((e) => e.map((e) => new BorrowTransactionsModel(e)))
      );
  }

  save(body: any) {
    return this.http.post<BorrowTransactionsModel>(this.apiBaseUrl, body);
  }

  update(body: BorrowTransactionsModel) {
    return this.http.put<{
      "message": string,
      "user": BorrowTransactionsModel
    }>(this.apiBaseUrl + "/" + body.borrowId, new BorrowTransactionsModel(body));
  }

  delete(body: BorrowTransactionsModel) {
    return this.http.delete<{
      "message": string,
      "user": BorrowTransactionsModel
    }>(this.apiBaseUrl + "/" + body.borrowId);
  }

  search(params : any) {
    // const params = new HttpParams()
    // if(peId){
    //   params.set('peId', peId!)
    // }
    // if(memberId){
    //   params.set('member_Id', memberId!)
    // }
      // .set('peId', peId!)
      // .set('member_Id', memberId!)

    return this.http.get<BorrowTransactionsModel[]>(`${this.apiBaseUrl}/search/borrow`, { params })
      .pipe(
        map((e) => e.map((e) => new BorrowTransactionsModel(e)))
      );
  }


}

