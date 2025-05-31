import { Component, ElementRef, Inject, Renderer2 } from '@angular/core';
// import { AuthService } from 'src/app/shared/services/auth.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DOCUMENT } from '@angular/common';
import { CarouselModule, OwlOptions, SlidesOutputData } from 'ngx-owl-carousel-o';
import { SharedModule } from '../../shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import { fromEvent } from 'rxjs';
import { TokenService } from '../../shared/services/token.service';
import { AuthService } from '../../shared/services/auth.service';
import { LoginModel } from '../../shared/user-auth.model';
import { HttpClientModule } from '@angular/common/http';
import { ProjectMemberService } from '../../DPU/services/project-members.service';
import { ToastrService } from 'ngx-toastr';
import swal from 'sweetalert';
import { StoreProfile, StoreProfileService } from '../../DPU/services/store-profile.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule, CarouselModule, CommonModule, RouterModule, FormsModule, HttpClientModule, ReactiveFormsModule],
  providers: [AuthService, { provide: ToastrService, useClass: ToastrService }],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  errorMessage: string = '';
  storeModel: StoreProfile = new StoreProfile();
  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private routes: Router,
    public tokenService: TokenService,
    private storeService: StoreProfileService,
  ) {
    this.form = this.fb.group({
      phone: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
    this.storeService.getProfile().subscribe(result => {
      this.storeModel = result;
    }, (error) => {
      console.error('Error fetching store profile:', error);
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.authService.login(this.form.controls['phone'].value, this.form.controls['password'].value).subscribe(result => {
      this.tokenService.saveToken(result);
      // this.tokenService.saveRefreshToken(result.refreshToken);
      this.tokenService.saveUser(result);
      if (result.is_active) {
        if (result.role == 'manager') {
          this.routes.navigate(['/admin/home'])
        } else if (result.role == 'staff') {
          this.routes.navigate(['/admin/walk-in'])
        } else if (result.role == 'customer') {
          this.routes.navigate(['/customer/home-customer'])
        }
      } else {
        this.errorMessage = 'ไม่สามารถใช้งานได้กรุณาติดต่อผู้ให้บริการ'
      }
      // this.routes.navigate(['/admin/member-manage'])
    }, (err) => {
      this.loading = false;
      this.errorMessage = err.error?.detail || 'เข้าสู่ระบบไม่สำเร็จ';
    })
  }
  // phone = ""
  // password = ""
  // errorMessage = '';
  // showLoader = false;
  // _error: { name: string; message: string } = { name: '', message: '' }; // for firbase _error handle
  // public error: any = '';

  // public loginForm!: FormGroup;

  // constructor(
  //   @Inject(DOCUMENT) private document: Document, private elementRef: ElementRef,
  //   private renderer: Renderer2,
  //   public tokenService: TokenService,
  //   private routes: Router,
  //   private formBuilder: FormBuilder,
  //   public authService: AuthService,
  //   private projectMember: ProjectMemberService
  // ) {
  //   localStorage.clear()
  // }
  // ngOnInit(): void {
  //   this.loginForm = this.formBuilder.group({
  //     phone: ['', Validators.required],
  //     password: ['', Validators.required],
  //   });
  //   this.renderer.addClass(this.document.body, 'bg-white');
  //   this.renderer.addClass(this.document.body, 'dark:bg-!bodybg');
  //   const ltr = this.elementRef.nativeElement.querySelectorAll('#switcher-ltr');
  //   const rtl = this.elementRef.nativeElement.querySelectorAll('#switcher-rtl');

  //   fromEvent(ltr, 'click').subscribe(() => {
  //     this.customOptions = { ...this.customOptions, rtl: false };
  //   });

  //   fromEvent(rtl, 'click').subscribe(() => {
  //     this.customOptions = { ...this.customOptions, rtl: true, autoplay: true };
  //   });
  // }
  // ngOnDestroy(): void {
  //   this.renderer.removeClass(this.document.body, 'bg-white');
  //   this.renderer.removeClass(this.document.body, 'dark:bg-!bodybg');
  // }
  // customOptions: OwlOptions = {
  //   loop: true,
  //   rtl: false,
  //   mouseDrag: true,
  //   touchDrag: true,
  //   pullDrag: false,
  //   dots: true,
  //   navSpeed: 700,
  //   autoplay: true,
  //   navText: ['<', '>'],
  //   autoHeight: true,
  //   autoWidth: true,
  //   responsive: {
  //     0: { items: 1 },
  //     400: { items: 1 },
  //     740: { items: 1 },
  //     1000: { items: 1 },
  //   },
  //   nav: true,
  // };

  // activeSlides!: SlidesOutputData;

  // slidesStore: any[] = [
  //   { img: './assets/images/authentication/2.png' },
  //   { img: './assets/images/authentication/3.png' },
  //   { img: "./assets/images/authentication/2.png" },
  // ];

  // getPassedData(data: SlidesOutputData) {
  //   this.activeSlides = data;
  //   console.log(this.activeSlides);
  // }
  // showPassword = false;
  // toggleClass = "off-line";
  // toggleVisibility() {
  //   this.showPassword = !this.showPassword;
  //   if (this.toggleClass === "off-line") {
  //     this.toggleClass = "line";
  //   } else {
  //     this.toggleClass = "off-line";
  //   }
  // }

  // login() {
  //   this.showLoader = true;
  //   let body: LoginModel = new LoginModel();
  //   body.phone = this.phone;
  //   body.password = this.password;
  //   this.authService.login(this.loginForm.controls['phone'].value, this.loginForm.controls['password'].value).subscribe(result => {
  //     this.tokenService.saveToken(result);
  //     // this.tokenService.saveRefreshToken(result.refreshToken);
  //     this.tokenService.saveUser(result);
  //     if (result.is_active) {
  //       if (result.role == 'manager') {
  //         this.routes.navigate(['/admin/home'])
  //       } else if (result.role == 'staff') {
  //         this.routes.navigate(['/admin/walk-in'])
  //       }  else if (result.role == 'customer') {
  //         this.routes.navigate(['/customer/home-customer'])
  //       }
  //     } else {
  //       this.error = 'ไม่สามารถใช้งานได้กรุณาติดต่อผู้ให้บริการ'
  //     }
  //     // this.routes.navigate(['/admin/member-manage'])
  //   }, (error) => {
  //     this.showLoader = false;
  //     this.error = 'เบอร์ติดต่อ หรือ Password ไม่ถูกต้อง';
  //   })

  // }

  // adminCompanyList(memberId: string) {
  //   this.projectMember.getCompanyAdmin(memberId).subscribe(result => {
  //     if (result.length > 0) {
  //       this.routes.navigate(['/company/home/' + result[0].projectId])
  //     }
  //     else {
  //       this.error = 'คุณไม่มีสิทธิ์ใช้งานในส่วนนี้'
  //     }
  //   }, (error) => {
  //     this.showLoader = false;
  //     this.error = 'คุณไม่มีสิทธิ์ใช้งานในส่วนนี้';
  //   })
  // }
}

