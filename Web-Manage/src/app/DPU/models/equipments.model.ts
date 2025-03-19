import { TranslateService } from "@ngx-translate/core";
import { BaseModel } from "./base.model";
import { environment } from "../../../environments/environment";

export class EquipmentModel extends BaseModel {
  equipmentId: string;
  picture: string;
  equipmentName: string;
  serialNumber: string;
  description?: string;
  quantity: number;
  is_returnable: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(data?: Partial<EquipmentModel>, translateService?: TranslateService) {
    super(data, translateService);
    this.picture = data?.picture ?? '';
    this.equipmentId = data?.equipmentId!
    this.equipmentName = data?.equipmentName ?? '';
    this.serialNumber = data?.serialNumber ?? '';
    this.description = data?.description ?? '';
    this.quantity = data?.quantity ?? 0;
    this.is_returnable = data?.is_returnable ?? true;
    this.createdAt = data?.createdAt ?? new Date().toISOString();
    this.updatedAt = data?.updatedAt ?? new Date().toISOString();
  }

  getPicture(): string {
    return this.picture ? environment.baseUrl + '/images/' + this.picture : './assets/images/faces/111.jpg'
  }
}

export class EquipmentStockModel {
  equipmentId: string;
  quantity: number;
  action: string;
  remark: string;
  created_by: string;
  lotId: string;
  created_at: string;
}
