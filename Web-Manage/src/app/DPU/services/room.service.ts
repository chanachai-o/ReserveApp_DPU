import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap, switchMap, filter, reduce } from "rxjs/operators";
import { RoomModel } from '../models/menus.model';
import { AvailableItem } from '../models/all.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {


  apiBaseUrl = "/rooms";
  constructor(
    private http: HttpClient
  ) { }

  getById(id: string) {
    return this.http
      .get<RoomModel>(this.apiBaseUrl + "/" + id)
      .pipe(map((e) => new RoomModel(e)));
  }

  getLists() {
    return this.http
      .get<RoomModel[]>(this.apiBaseUrl)
      .pipe(
        map((e) => e.map((e) => new RoomModel(e)))
      );
  }


  getActiveList() {
    return this.http
      .get<RoomModel[]>(this.apiBaseUrl + "/?status=available")
      .pipe(
        map((e) => e.map((e) => new AvailableItem(e)))
      );
  }

  reseave(roomId: number) {
    return this.http.patch<{
      "message": string,
      "user": RoomModel
    }>(this.apiBaseUrl + "/" + roomId + "/status", {
      "status": "reserved"
    });
  }


  save(body: RoomModel) {
    return this.http.post<{
      "message": string,
      "user": RoomModel
    }>(this.apiBaseUrl, new RoomModel(body));
  }

  update(body: RoomModel) {
    return this.http.put<{
      "message": string,
      "user": RoomModel
    }>(this.apiBaseUrl + "/" + body.id, new RoomModel(body));
  }

  delete(body: RoomModel) {
    return this.http.delete<{
      "message": string,
      "user": RoomModel
    }>(this.apiBaseUrl + "/" + body.id);
  }

  cancelReseave(roomId: number) {
    return this.http.patch<{
      "message": string,
      "user": RoomModel
    }>(this.apiBaseUrl + "/" + roomId + "/status", {
      "status": "available"
    });
  }

}
