import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap, switchMap, filter, reduce } from "rxjs/operators";
import { ProjectMemberModel } from '../models/project-members';


@Injectable({
  providedIn: 'root'
})
export class ProjectMemberService {
  apiBaseUrl = "/project-members";
  constructor(
    private http: HttpClient
  ) { }

  getById(id: string) {
    return this.http
      .get<ProjectMemberModel>(this.apiBaseUrl + "/" + id)
      .pipe(map((e) => new ProjectMemberModel(e)));
  }

  getLists(projectId: string) {
    return this.http
      .get<ProjectMemberModel[]>(this.apiBaseUrl+ "/project/" +projectId)
      .pipe(
        map((e) => e.map((e) => new ProjectMemberModel(e)))
      );
  }


  save(body: any) {
    return this.http.post<ProjectMemberModel>(this.apiBaseUrl, body);
  }

  update(body: ProjectMemberModel) {
    return this.http.put<{
      "message": string,
      "user": ProjectMemberModel
    }>(this.apiBaseUrl + "/" + body.memberId, new ProjectMemberModel(body));
  }

  delete(body: ProjectMemberModel) {
    return this.http.delete<{
      "message": string,
      "user": ProjectMemberModel
    }>(this.apiBaseUrl + "/" + body.pmId);
  }

  getCompanyAdmin(memberId: string) {
    return this.http
      .get<ProjectMemberModel[]>(this.apiBaseUrl + "/member/" + memberId)
      .pipe(
        map((e) => e.map((e) => new ProjectMemberModel(e)))
      );
  }


}
