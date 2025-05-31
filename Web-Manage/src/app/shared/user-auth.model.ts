export class LoginModel {
  public phone: string = "";
  public password: string = "";
}

export interface ProfileModel {
  phone: string;
  name: string;
  hashed_password: string;
  id: number;
  role: string;
  is_active: boolean;
}

