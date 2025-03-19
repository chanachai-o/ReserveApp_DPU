import { environment } from "../../../environments/environment";

export class ProjectModel {
  projectId?: string;
  picture: string;
  project_name: string;
  project_desc?: string;
  project_code?: string;
  responsible?: string;
  contact?: string;
  start_date: string;
  end_date: string;
  // created_at: string;
  // updated_at: string;

  constructor(data?: Partial<ProjectModel>) {
    this.picture = data?.picture ?? '';
    this.projectId = data?.projectId
    this.project_name = data?.project_name ?? '';
    this.project_code = data?.project_code ?? '';
    this.responsible = data?.responsible ?? '';
    this.project_desc = data?.project_desc ?? '';
    this.contact = data?.contact ?? '';
    this.start_date = data?.start_date!
    this.end_date = data?.end_date!
    // this.created_at = data?.created_at!
    // this.updated_at = data?.updated_at!
  }

  getPicture(): string {
    return this.picture ? environment.baseUrl + '/images/' + this.picture : './assets/images/faces/9.jpg'
  }
}
