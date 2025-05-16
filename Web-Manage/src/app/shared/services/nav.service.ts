import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
// Menu
export interface Menu {
  headTitle?: string;
  headTitle2?: string;
  path?: string;
  title?: string;
  icon?: string;
  type?: string;
  badgeValue?: string;
  badgeClass?: string;
  badgeText?: string;
  active?: boolean;
  selected?: boolean;
  bookmark?: boolean;
  children?: Menu[];
  children2?: Menu[];
  Menusub?: boolean;
  target?: boolean;
  menutype?: string
}

@Injectable({
  providedIn: 'root',
})
export class NavService implements OnDestroy {
  private unsubscriber: Subject<any> = new Subject();
  public screenWidth: BehaviorSubject<number> = new BehaviorSubject(
    window.innerWidth
  );

  // Search Box
  public search = false;

  // Language
  public language = false;

  // Mega Menu
  public megaMenu = false;
  public levelMenu = false;
  public megaMenuColapse: boolean = window.innerWidth < 1199 ? true : false;

  // Collapse Sidebar
  public collapseSidebar: boolean = window.innerWidth < 991 ? true : false;

  // For Horizontal Layout Mobile
  public horizontal: boolean = window.innerWidth < 991 ? false : true;

  // Full screen
  public fullScreen = false;
  active: any;

  constructor(private router: Router, private tokenService: TokenService) {
    this.setScreenWidth(window.innerWidth);
    fromEvent(window, 'resize')
      .pipe(debounceTime(1000), takeUntil(this.unsubscriber))
      .subscribe((evt: any) => {
        this.setScreenWidth(evt.target.innerWidth);
        if (evt.target.innerWidth < 991) {
          this.collapseSidebar = true;
          this.megaMenu = false;
          this.levelMenu = false;
        }
        if (evt.target.innerWidth < 1199) {
          this.megaMenuColapse = true;
        }
      });
    if (window.innerWidth < 991) {
      // Detect Route change sidebar close
      this.router.events.subscribe((event) => {
        this.collapseSidebar = true;
        this.megaMenu = false;
        this.levelMenu = false;
      });
    }
  }

  ngOnDestroy() {
    this.unsubscriber.next;
    this.unsubscriber.complete();
  }

  private setScreenWidth(width: number): void {
    this.screenWidth.next(width);
  }

  MENUITEMS: Menu[] = []

  getCommonMenu() {
    // return [
    //   // Dashboard
    //   { headTitle: 'ผู้ดูแลระบบ' },
    //   {
    //     icon: 'user',
    //     path: '/admin/member-manage',
    //     title: 'จัดการสมาชิก',
    //     type: 'link',
    //   },

    //   {
    //     icon: 'buildings',
    //     path: '/admin/manage-companys',
    //     title: 'จัดการบริษัท',
    //     type: 'link',
    //   },

    //   {
    //     icon: 'user-check',
    //     path: '/admin/admin-manage',
    //     title: 'จัดการสิทธิ์ผู้ดูแลระบบ',
    //     type: 'link',
    //   },
    //   // { headTitle: 'User Management' },

    // ];
    return [{ headTitle: 'Admin' },
    // { path: '/admin/home', title: 'หน้าแรก', type: 'link' },
    {
      title: 'การจัดการ',
      type: 'sub',
      selected: false,
      Menusub: true,
      active: false,
      children: [
        { path: '/admin/manage-store', title: 'จัดการร้าน', type: 'link' },
        { path: '/admin/manage-member', title: 'พนักงาน', type: 'link' },
        { path: '/admin/manage-customer', title: 'ลูกค้า', type: 'link' },
        { path: '/admin/manage-menu', title: 'รายการอาหาร', type: 'link' },
        {
          path: '/admin/manage-table',
          title: 'โต๊ะอาหาร',
          type: 'link',
        },
        {
          path: '/admin/manage-room',
          title: 'ห้องประชุม',
          type: 'link',
        },
      ],
    },
    {
      title: 'การบริการ',
      type: 'sub',
      selected: false,
      Menusub: true,
      active: false,
      children: [
        { path: '/admin/manage-store', title: 'Walk-In', type: 'link' },
        { path: '/admin/manage-store', title: 'Reserved', type: 'link' },
        { path: '/admin/manage-store', title: 'Take-Home', type: 'link' },
      ],
    },
      // {
      //   path: '/admin/borrow-management',
      //   title: 'การเบิกคืนอุปกรณ์',
      //   type: 'link',
      //   selected: false,
      //   Menusub: true,
      //   active: false,
      // }
    ]
  }

  items = new BehaviorSubject<Menu[]>(this.MENUITEMS);
}
