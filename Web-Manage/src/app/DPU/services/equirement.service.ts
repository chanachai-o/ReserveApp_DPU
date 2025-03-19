import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EquipmentModel } from '../models/equipments.model';
import { map, tap, switchMap, filter, reduce } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {


  apiBaseUrl = "/equipments";
  constructor(
    private http: HttpClient
  ) { }

  getById(id: string) {
    return this.http
      .get<EquipmentModel>(this.apiBaseUrl + "/" + id)
      .pipe(map((e) => new EquipmentModel(e)));
  }

  getLists() {
    return this.http
      .get<EquipmentModel[]>(this.apiBaseUrl)
      .pipe(
        map((e) => e.map((e) => new EquipmentModel(e)))
      );
  }

  save(body: EquipmentModel) {
    return this.http.post<{
      "message": string,
      "user": EquipmentModel
    }>(this.apiBaseUrl, new EquipmentModel(body));
  }

  update(body: EquipmentModel) {
    return this.http.put<{
      "message": string,
      "user": EquipmentModel
    }>(this.apiBaseUrl + "/" + body.equipmentId, new EquipmentModel(body));
  }

  delete(body: EquipmentModel) {
    return this.http.delete<{
      "message": string,
      "user": EquipmentModel
    }>(this.apiBaseUrl + "/" + body.equipmentId);
  }

  stock(body: {
    equipmentId: string;
    quantity: number;
    action: string;
    remark: string;
    created_by: string;
  }) {
    return this.http.post<{
      equipmentId: string;
      quantity: number;
      action: string;
      remark: string;
      created_by: string;
      lotId: string;
      created_at: string;
    }>("/inventory-lots", body);
  }


}
