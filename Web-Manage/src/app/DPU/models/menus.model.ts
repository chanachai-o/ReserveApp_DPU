import { environment } from "../../../environments/environment";

export class MenuModel {
  name: string;
  description: string;
  category: string;
  price: string;
  id: number;
  is_active: boolean;
  picture: string;

  constructor(data?: Partial<MenuModel>) {
    this.picture = data?.picture ?? '';
    this.name = data?.name!
    this.description = data?.description!
    this.category = data?.category!
    this.price = data?.price!
    this.id = data?.id!
    this.is_active = data?.is_active!
  }

  getPicture(): string {
    return this.picture ? environment.baseUrl + '/images/' + this.picture : './assets/images/faces/111.jpg'
  }

  getStatus(): string {
    if (this.is_active) {
      return 'เปิดบริการ'
    } else {
      return 'ปิดการให้บริการ'
    }
  }

}
