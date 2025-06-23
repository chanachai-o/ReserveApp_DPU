import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TablesModel } from '../models/menus.model';
import { map, tap, switchMap, filter, reduce } from "rxjs/operators";
import { AvailableItem } from '../models/all.model';

@Injectable({
  providedIn: 'root'
})
export class TablesService {


  apiBaseUrl = "/api/tables";
  constructor(
    private http: HttpClient
  ) { }

  getById(id: string) {
    return this.http
      .get<TablesModel>(this.apiBaseUrl + "/" + id)
      .pipe(map((e) => new TablesModel(e)));
  }

  getLists() {
    return this.http
      .get<TablesModel[]>(this.apiBaseUrl)
      .pipe(
        map((e) => e.map((e) => new TablesModel(e)))
      );
  }

  getActiveList() {
    return this.http
      .get<TablesModel[]>(this.apiBaseUrl + "/?status=available")
      .pipe(
        map((e) => e.map((e) => new AvailableItem(e)))
      );
  }

  save(body: TablesModel) {
    return this.http.post<{
      "message": string,
      "user": TablesModel
    }>(this.apiBaseUrl, new TablesModel(body));
  }

  update(body: TablesModel) {
    return this.http.put<{
      "message": string,
      "user": TablesModel
    }>(this.apiBaseUrl + "/" + body.id, new TablesModel(body));
  }

  delete(body: TablesModel) {
    return this.http.delete<{
      "message": string,
      "user": TablesModel
    }>(this.apiBaseUrl + "/" + body.id);
  }

  reserve(tableId: number) {
    return this.http.patch<{
      "message": string,
      "user": TablesModel
    }>(this.apiBaseUrl + "/" + tableId + "/status", {
      "status": "reserved"
    });
  }

  cancelReseave(tableId: number) {
    return this.http.patch<{
      "message": string,
      "user": TablesModel
    }>(this.apiBaseUrl + "/" + tableId + "/status", {
      "status": "available"
    });
  }

}
