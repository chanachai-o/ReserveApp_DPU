import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { SharedModule } from "../../../shared/shared.module";
import { FormsModule } from "@angular/forms";
import swal from 'sweetalert';
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { UserRoleModel } from "../../models/user-role-model";
import { FileUploadModule } from 'ng2-file-upload';
import { FileItem, FileUploader, ParsedResponseHeaders } from "ng2-file-upload";
import { environment } from "../../../../environments/environment";
import { TokenService } from "../../../shared/services/token.service";
import { ProjectMemberService } from "../../services/project-members.service";
import { ProjectMemberModel } from "../../models/project-members";
import { UserService } from "../../services/user.service";
import { UserProfileModel } from "../../models/user.model";
import { ProjectEquipmentModel } from "../../models/project-equipments";
import { BorrowTransactionsService } from "../../services/borrow-transactions.service";
import { BorrowTransactionsModel } from "../../models/borrow-transactions";
@Component({
  selector: 'app-admin-project-emp-manage',
  standalone: true,
  imports: [CommonModule,
    SharedModule,
    TranslateModule,
    NgSelectModule,
    FormsModule,
    MatPaginator,
    FileUploadModule],
  templateUrl: './admin-project-emp-manage.component.html',
  styleUrl: './admin-project-emp-manage.component.scss'
})
export class AdminProjectEmpManageComponent {
  @ViewChild('closeModal') public childModal?: ElementRef;
  @ViewChild('modalDetail') public modalDetail?: ElementRef;
  action = "new";
  allSelected = false;
  someSelected = false;
  confirmPassword = ""
  itemsList: ProjectMemberModel[] = []
  filterList: ProjectMemberModel[] = []
  selectModel: ProjectMemberModel = new ProjectMemberModel()
  selectedItems = new Map<string, boolean>();
  roleList: UserRoleModel[] = []
  empList: ProjectMemberModel[] = []
  descName = 'engName'
  pageIndex = 0;
  uploaderProfile: FileUploader | undefined;
  uploadErrorMsg: string = "";

  userList: UserProfileModel[] = []
  get searchTerm(): string {
    return this._searchTerm;
  }
  set searchTerm(val: string) {
    this.pageIndex = 0;
    this.allSelected = false
    this._searchTerm = val;
    if (val != '') {
      this.filterList = this.filter(val);
    } else {
      this.updatePagedItems()
    }
  }
  projectId = ""
  _searchTerm = "";
  hisList: BorrowTransactionsModel[] = []
  constructor(private projectMemberService: ProjectMemberService, private userService: UserService, public translate: TranslateService, private tokenService: TokenService, private borrowTransactionsService: BorrowTransactionsService) {
    this.projectId = this.tokenService.getSelectCompany().projectId!;
    this.getUserProject()
    this.getMemberAll()
    this.uploadConfig()
  }

  getMemberAll() {
    this.userService.getLists().subscribe(result => {
      this.userList = result
    })
  }

  uploadConfig() {
    this.uploaderProfile = new FileUploader({
      url: environment.baseUrl + "/api/upload-image",
      isHTML5: true,
      authToken: this.tokenService.getToken()!,
    });

    this.uploaderProfile.onAfterAddingFile = (fileItem: FileItem) => {
      fileItem.withCredentials = false;
      this.uploadErrorMsg = "";

      while (this.uploaderProfile!.queue.length > 1) {
        this.uploaderProfile!.queue[0].remove();
      }

      if (fileItem.file.size > 5000000) {
        this.uploadErrorMsg = "maximum file size 5mb.";
        swal("Opp!!", "ไม่สามารถอัพโหลดได้", "info");
        fileItem.isCancel = true;
        return;
      }

      if (fileItem.file.type!.indexOf("image") === -1) {
        this.uploadErrorMsg = "please upload image only.";
        swal("Opp!!", "ไม่สามารถอัพโหลดได้", "info");
        fileItem.isCancel = true;
        return;
      }

      fileItem.upload();
    };

    this.uploaderProfile.onCompleteItem = (
      item: FileItem,
      response: string,
      status: number,
      headers: ParsedResponseHeaders
    ) => {
      if (item.isSuccess) {
        const res = JSON.parse(response);
        console.log("res", res);
        this.selectModel.member.picture = res.filename
        swal(res.message, "บันทึกสำเร็จ", "success");

      } else {
        this.uploadErrorMsg = "cannot upload file.";
        swal("Opp!!", "ไม่สามารถอัพโหลดได้", "info");
      }
    };
  }


  ngOnInit(): void {
    // this.projectMemberService.getLists(this.projectId).subscribe(result => {
    //   this.itemsList = result
    //   this.updatePagedItems()
    // })
  }

  viewHisStock(item: UserProfileModel) {
    this.borrowTransactionsService.search({ "member_id": item.memberId }).subscribe(result => {
      this.hisList = result
    })
  }

  getUserProject() {
    this.projectMemberService.getLists(this.projectId).subscribe(result => {
      this.itemsList = result
      this.updatePagedItems()
    })
  }

  filter(v: string) {
    return this.itemsList?.filter(
      (x) =>
        x.member.memberId?.toLowerCase().indexOf(v.toLowerCase()) !== -1 ||
        x.member.username?.toLowerCase().indexOf(v.toLowerCase()) !== -1 ||
        x.member.email?.toLowerCase().indexOf(v.toLowerCase()) !== -1 ||
        x.member.phoneNumber?.toLowerCase().indexOf(v.toLowerCase()) !== -1 ||
        x.member.getRole()?.toLowerCase().indexOf(v.toLowerCase()) !== -1 ||
        x.member.getStatus()?.toLowerCase().indexOf(v.toLowerCase()) !== -1 ||
        x.member.getFullname()?.toLowerCase().indexOf(v.toLowerCase()) !== -1
    );
  }

  delete(item: ProjectMemberModel) {
    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",

      dangerMode: true,
      buttons: ["Cancel", "Yes,Delete it!"],
    })
      .then((willDelete: any) => {
        if (willDelete) {
          this.projectMemberService.delete(item).subscribe(result => {
            swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
            this.getUserProject()
          })
        }

      });
  }

  new() {
    this.action = 'add'
    this.selectModel = new ProjectMemberModel()
  }

  view(item: ProjectMemberModel) {
    this.action = 'edit'
    this.confirmPassword = ''
    this.selectModel = new ProjectMemberModel(item)
    console.log(this.selectModel)

  }

  selectMember(item: UserProfileModel) {
    swal({
      title: "Are you sure?",
      text: "คุณต้องการบันทึกหรือไม่",
      icon: "warning",
      dangerMode: false,
      buttons: ["Cancel", "Confirm"],
    })
      .then((willDelete: any) => {
        if (willDelete) {
          if (this.action == 'add') {
            this.projectMemberService.save({
              "memberId": item.memberId,
              "role_in_project": "employee",
              "projectId": this.projectId
            }).subscribe(result => {
              console.log(result)
              swal("Save Success!!", "บันทึกข้อมูลสมาชิก", "success");
              this.getUserProject()
              this.childModal?.nativeElement.click()
            })
          } else if (this.action == 'edit') {
            this.projectMemberService.update(this.selectModel).subscribe(result => {
              console.log(result)
              swal("Update Success!!", "บันทึกข้อมูลสมาชิก", "success");
              this.getUserProject()
              this.childModal?.nativeElement.click()
            })
          }

        }

      });


  }

  updatePagedItems() {
    const startIndex = this.pageIndex * 10;
    const endIndex = startIndex + 10;
    this.filterList = this.itemsList.slice(startIndex, endIndex);
  }

  toggleAll(event: any) {
    this.allSelected = event.target.checked;
    this.selectedItems.clear();
    this.itemsList.forEach(item => {
      this.selectedItems.set(item.memberId, this.allSelected);
    });
    this.someSelected = this.itemsList.some(item => this.selectedItems.get(item.memberId));
  }

  onCheckboxChange(memberId: string) {
    const isSelected = this.selectedItems.get(memberId) || false;
    this.selectedItems.set(memberId, !isSelected);
    this.allSelected = this.itemsList.every(item => this.selectedItems.get(item.memberId));
    this.someSelected = this.itemsList.some(item => this.selectedItems.get(item.memberId));
  }

  deleteSelect() {
    let employeeInfo = '';
    this.selectedItems.forEach((isSelected, memberId) => {
      if (isSelected) {
        const user = this.itemsList.find(user => user.memberId === memberId);
        if (user) {
          employeeInfo += `${this.translate.instant('Fullname')}: ${user.member.getFullname()}\n`;
        }
      }
    });

    swal({
      title: "Are you sure?",
      text: employeeInfo,
      icon: "warning",
      dangerMode: true,
      buttons: ["Cancel", "Yes, Delete it!"],
    })
      .then((willDelete: any) => {
        if (willDelete) {
          this.selectedItems.forEach((isSelected, memberId) => {
            if (isSelected) {
              const user = this.itemsList.find(user => user.memberId === memberId);
              if (user) {
                this.projectMemberService.delete(user).subscribe(result => {
                  swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
                  this.getUserProject();
                });
              }
            }
          });
        }
      });
  }


  filterEmp(empId: string) {
    this.selectModel = this.empList.filter(e => e.memberId == empId)[0]
  }

  // selectMember(){

  // }

}
