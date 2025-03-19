import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap, switchMap, filter, reduce } from "rxjs/operators";
import { ProjectModel } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
apiBaseUrl = "/projects";
  constructor(
    private http: HttpClient
  ) { }

  getById(id: string) {
    return this.http
      .get<ProjectModel>(this.apiBaseUrl + "/" + id)
      .pipe(map((e) => new ProjectModel(e)));
  }

  getLists() {
    return this.http
      .get<ProjectModel[]>(this.apiBaseUrl)
      .pipe(
        map((e) => e.map((e) => new ProjectModel(e)))
      );
  }

  save(body: ProjectModel) {
    return this.http.post<{
      "message": string,
      "user": ProjectModel
    }>(this.apiBaseUrl, new ProjectModel(body));
  }

  update(body: ProjectModel) {
    return this.http.put<{
      "message": string,
      "user": ProjectModel
    }>(this.apiBaseUrl + "/" + body.projectId, new ProjectModel(body));
  }

  delete(body: ProjectModel) {
    return this.http.delete<{
      "message": string,
      "user": ProjectModel
    }>(this.apiBaseUrl + "/" + body.projectId);
  }


}
