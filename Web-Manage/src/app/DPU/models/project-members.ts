import { TranslateService } from "@ngx-translate/core";
import { BaseModel } from "./base.model";
import { ProjectModel } from "./project.model";
import { UserProfileModel } from "./user.model";

export class ProjectMemberModel extends BaseModel {
  memberId: string;
  role_in_project: string;
  pmId: string;
  projectId: string;
  project: ProjectModel;
  member: UserProfileModel;

  constructor(data?: Partial<ProjectMemberModel>, translateService?: TranslateService) {
    super(data, translateService);
    this.pmId = data?.pmId ?? '';
    this.memberId = data?.memberId ?? '';
    this.projectId = data?.projectId ?? '';
    this.role_in_project = data?.role_in_project ?? '';

    this.project = data?.project || new ProjectModel();
    this.member = data?.member ? new UserProfileModel(data.member) : new UserProfileModel();
  }
}
