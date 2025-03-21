import { TranslateService } from "@ngx-translate/core";
import { BaseModel } from "./base.model";
import { ProjectModel } from "./project.model";
import { EquipmentModel } from "./menus.model";

export class ProjectEquipmentModel extends BaseModel {
  quantity_in_project: number;
  peId: string;
  projectId: string;
  equipmentId: string;
  project: ProjectModel;
  equipment: EquipmentModel;

  constructor(data?: Partial<ProjectEquipmentModel>, translateService?: TranslateService) {
    super(data, translateService);
    this.peId = data?.peId ?? '';
    this.projectId = data?.projectId ?? '';
    this.equipmentId = data?.equipmentId ?? '';
    this.quantity_in_project = data?.quantity_in_project ?? 0;
    this.project = data?.project || new ProjectModel();
    this.equipment = data?.equipment ? new EquipmentModel(data.equipment) : new EquipmentModel();
  }
}
