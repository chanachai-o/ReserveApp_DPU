import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap, switchMap, filter, reduce } from "rxjs/operators";
import { ProjectEquipmentModel } from '../models/project-equipments';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ProjectEquipmentService {
  apiBaseUrl = environment.baseUrl + "/project-equipments";
  constructor(
    private http: HttpClient
  ) { }

  getById(id: string) {
    return this.http
      .get<ProjectEquipmentModel>(this.apiBaseUrl + "/" + id)
      .pipe(map((e) => new ProjectEquipmentModel(e)));
  }
  getLists(projectId: string) {
    return this.http
      .get<ProjectEquipmentModel[]>(this.apiBaseUrl+ "/project/" +projectId)
      .pipe(
        map((e) => e.map((e) => new ProjectEquipmentModel(e)))
      );
  }

  save(body: any) {
    return this.http.post<ProjectEquipmentModel>(this.apiBaseUrl, body);
  }

  update(body: ProjectEquipmentModel) {
    return this.http.put<{
      "message": string,
      "user": ProjectEquipmentModel
    }>(this.apiBaseUrl + "/" + body.equipmentId, new ProjectEquipmentModel(body));
  }

  delete(body: ProjectEquipmentModel) {
    return this.http.delete<{
      "message": string,
      "user": ProjectEquipmentModel
    }>(this.apiBaseUrl + "/" + body.equipmentId);
  }


}
