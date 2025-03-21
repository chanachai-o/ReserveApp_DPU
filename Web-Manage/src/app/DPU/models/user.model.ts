import { TranslateService } from "@ngx-translate/core";
import { BaseModel } from "./base.model";
import { environment } from "../../../environments/environment";

export class UserProfileModel extends BaseModel {
  phone: string;
  name: string;
  hashed_password: string;
  password: string;
  id: number = 0
  role: string;
  is_active: boolean;
  picture: string
  constructor(
    data?: Partial<UserProfileModel>,
    translateService?: TranslateService
  ) {
    super(data, translateService);
    this.phone = data?.phone!;
    this.name = data?.name!
    this.password = data?.password!
    this.hashed_password = data?.hashed_password!
    this.id = data?.id || this.id
    this.role = data?.role || ""
    this.is_active = data?.is_active!
    this.picture = data?.picture!
  }

  // getRole(): string {
  //   if (this.role == 99) {
  //     return this.translateService.instant('Admin-System')
  //   }
  //   else if (this.role == 1) {
  //     return this.translateService.instant('Admin-Company')
  //   } else {
  //     return this.translateService.instant('User')
  //   }
  // }

  getStatus(): string {
    if (this.is_active) {
      return this.translateService.instant('Active')
    } else {
      return this.translateService.instant('Unactive')
    }
  }

  getPicture(): string {
    return this.picture ? environment.baseUrl + '/images/' + this.picture : './assets/images/faces/1.jpg'
  }
}
