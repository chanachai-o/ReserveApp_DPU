import { TranslateService } from "@ngx-translate/core";
import { BaseModel } from "./base.model";
import { UserProfileModel } from "./user.model";
import { EquipmentModel } from "./menus.model";
import { ProjectEquipmentModel } from "./project-equipments";

export class BorrowTransactionsModel extends BaseModel {
  peId: string;
  quantity_borrowed: number;
  status: string;
  returned_date: string;
  memberId: string;
  approved_by: string;
  borrowId: string;
  created_at: string;
  member: UserProfileModel;
  project_equipment: ProjectEquipmentModel;
  approved_by_member: UserProfileModel;

  constructor(data?: Partial<BorrowTransactionsModel>, translateService?: TranslateService) {
    super(data, translateService);
    this.borrowId = data?.borrowId ?? '';
    this.peId = data?.peId ?? '';
    this.quantity_borrowed = data?.quantity_borrowed ?? 0;
    this.status = data?.status ?? '';
    this.returned_date = data?.returned_date ?? ''
    this.memberId = data?.memberId ?? ''
    this.approved_by = data?.approved_by ?? ''
    this.member = data?.member ? new UserProfileModel(data.member) : new UserProfileModel();
    this.approved_by_member = data?.approved_by_member ? new UserProfileModel(data.approved_by_member) : new UserProfileModel();
    this.project_equipment = data?.project_equipment ? new ProjectEquipmentModel(data.project_equipment) : new ProjectEquipmentModel();
  }
}
