import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MenuModel } from '../models/menus.model';
import { map, tap, switchMap, filter, reduce } from "rxjs/operators";

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
      .get<MenuModel>(this.apiBaseUrl + "/" + id)
      .pipe(map((e) => new MenuModel(e)));
  }

  getLists() {
    return this.http
      .get<MenuModel[]>(this.apiBaseUrl)
      .pipe(
        map((e) => e.map((e) => new MenuModel(e)))
      );
  }

  save(body: MenuModel) {
    return this.http.post<{
      "message": string,
      "user": MenuModel
    }>(this.apiBaseUrl, new MenuModel(body));
  }

  update(body: MenuModel) {
    return this.http.put<{
      "message": string,
      "user": MenuModel
    }>(this.apiBaseUrl + "/" + body.id, new MenuModel(body));
  }

  delete(body: MenuModel) {
    return this.http.delete<{
      "message": string,
      "user": MenuModel
    }>(this.apiBaseUrl + "/" + body.id);
  }

}
