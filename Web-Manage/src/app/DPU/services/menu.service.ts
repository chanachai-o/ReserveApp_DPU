import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap, switchMap, filter, reduce } from "rxjs/operators";
import { MenusModel } from '../models/all.model';

@Injectable({
  providedIn: 'root'
})
export class MenusService {


  apiBaseUrl = "/menus";
  constructor(
    private http: HttpClient
  ) { }

  getById(id: string) {
    return this.http
      .get<MenusModel>(this.apiBaseUrl + "/" + id)
      .pipe(map((e) => new MenusModel(e)));
  }

  getLists() {
    return this.http
      .get<MenusModel[]>(this.apiBaseUrl)
      .pipe(
        map((e) => e.map((e) => new MenusModel(e)))
      );
  }

  save(body: MenusModel) {
    return this.http.post<{
      "message": string,
      "user": MenusModel
    }>(this.apiBaseUrl, new MenusModel(body));
  }

  update(body: MenusModel) {
    return this.http.put<{
      "message": string,
      "user": MenusModel
    }>(this.apiBaseUrl + "/" + body.id, new MenusModel(body));
  }

  delete(body: MenusModel) {
    return this.http.delete<{
      "message": string,
      "user": MenusModel
    }>(this.apiBaseUrl + "/" + body.id);
  }

}
