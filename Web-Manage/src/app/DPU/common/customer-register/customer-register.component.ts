import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import swal from 'sweetalert';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../shared/services/auth.service';
import { TokenService } from '../../../shared/services/token.service';
import { UserProfileModel } from '../../models/user.model';
import { StoreProfile, StoreProfileService } from '../../services/store-profile.service';
@Component({
  selector: 'app-customer-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './customer-register.component.html',
  styleUrl: './customer-register.component.scss'
})
export class CustomerRegisterComponent {
  form: FormGroup;
  loading = false;
  storeModel: StoreProfile = new StoreProfile();
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    public authService: AuthService,
    private tokenService: TokenService,
    private storeService: StoreProfileService,
  ) {
    this.form = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      name: [''] // เผื่อสำหรับสมัครสมาชิก
    });
    this.storeService.getProfile().subscribe(result => {
      this.storeModel = result;
    }, (error) => {
      console.error('Error fetching store profile:', error);
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    const { phone, password, name } = this.form.value;

    try {
      // 1. ตรวจสอบสมาชิก (login)
      // const loginRes = await this.http.post<any>('/api/auth/login', { phone, password }).toPromise();
      // if (loginRes && loginRes.token) {
      //   // Success: เป็นสมาชิกแล้ว
      //   localStorage.setItem('token', loginRes.token);
      //   this.router.navigate(['/customer/dashboard']);
      //   return;
      // }
      this.authService.login(phone, password).subscribe(result => {
        if (result) {
          // Success: เป็นสมาชิกแล้ว
          this.tokenService.saveToken(result);
          // this.tokenService.saveRefreshToken(result.refreshToken);
          this.tokenService.saveUser(result);
          this.router.navigate(['/customer/home-customer']);
          swal('เข้าสู่ระบบสำเร็จ', 'ยินดีต้อนรับ!', 'success');
        } else {
          throw new Error('Login failed');
        }
      }, (error) => {
        let user = new UserProfileModel();
        user.phone = phone;
        user.password = password;
        user.name = name || `ลูกค้า${phone.slice(-4)}`;
        user.role = 'customer';
        this.authService.registerCustomer(user).subscribe(result => {
          if (result) {
            this.tokenService.saveToken(result);
            this.tokenService.saveUser(result);
            swal('สมัครสมาชิกสำเร็จ', 'เข้าสู่ระบบเรียบร้อย', 'success');
            this.router.navigate(['/customer/home-customer']);
          }
        }, (error) => {
          swal('เกิดข้อผิดพลาด', 'ไม่สามารถสมัครสมาชิก/เข้าสู่ระบบได้', 'error');
        });
      });

    } catch (err: any) {
      swal('เกิดข้อผิดพลาด', 'ไม่สามารถสมัครสมาชิก/เข้าสู่ระบบได้', 'error');
    } finally {
      this.loading = false;
    }
  }
}
