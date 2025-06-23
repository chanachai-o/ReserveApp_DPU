import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { FormsModule } from "@angular/forms";
import swal from 'sweetalert';
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { FileUploadModule } from 'ng2-file-upload';
import { FileItem, FileUploader, ParsedResponseHeaders } from "ng2-file-upload";
import { UserProfileModel } from "../../models/user.model";
import { SharedModule } from "../../../shared/shared.module";
import { UserService } from "../../services/user.service";
import { TokenService } from "../../../shared/services/token.service";
import { environment } from "../../../../environments/environment";

@Component({
  selector: 'app-customer-management',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    NgSelectModule,
    FormsModule,
    MatPaginator,
    FileUploadModule
  ],
  templateUrl: './customer-management.component.html',
  styleUrls: ['./customer-management.component.css']
})
export class CustomerManagementComponent implements OnInit {
  @ViewChild('closeModal') public childModal?: ElementRef;
  @ViewChild('modalDetail') public modalDetail?: ElementRef;
  action = "new";
  allSelected = false;
  someSelected = false;
  confirmPassword = ""
  itemsList: UserProfileModel[] = []
  filterList: UserProfileModel[] = []
  selectModel: UserProfileModel = new UserProfileModel()
  selectedItems = new Map<number, boolean>();
  empList: UserProfileModel[] = []
  descName = 'engName'
  pageIndex = 0;
  uploaderProfile: FileUploader | undefined;
  uploadErrorMsg: string = "";
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

  _searchTerm = "";
  constructor(private userService: UserService, public translate: TranslateService, private tokenService: TokenService) {
    this.uploadConfig()
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
        this.selectModel.picture = res.filename
        swal(res.message, "บันทึกสำเร็จ", "success");

      } else {
        this.uploadErrorMsg = "cannot upload file.";
        swal("Opp!!", "ไม่สามารถอัพโหลดได้", "info");
      }
    };
  }


  ngOnInit(): void {
    this.userService.getUsers().subscribe(result => {
      this.itemsList = result.filter(e => e.role == 'customer')
      this.updatePagedItems()
    })
  }

  filter(v: string) {
    return this.itemsList?.filter(
      (x) =>
        x.id?.toString().toLowerCase().indexOf(v.toLowerCase()) !== -1 ||
        x.name?.toLowerCase().indexOf(v.toLowerCase()) !== -1 ||
        x.phone?.toLowerCase().indexOf(v.toLowerCase()) !== -1 ||
        x.role?.toLowerCase().indexOf(v.toLowerCase()) !== -1
    );
  }

  delete(item: UserProfileModel) {
    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",

      dangerMode: true,
      buttons: ["Cancel", "Yes,Delete it!"],
    })
      .then((willDelete: any) => {
        if (willDelete) {
          this.userService.deleteUser(item.id).subscribe(result => {
            swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
            this.ngOnInit()
          })
        }

      });
  }

  new() {
    this.action = 'add'
    this.selectModel = new UserProfileModel()
  }

  view(item: UserProfileModel) {
    this.action = 'edit'
    this.confirmPassword = ''
    this.selectModel = new UserProfileModel(item)
    console.log(this.selectModel)

  }

  save() {
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
            this.userService.createUser(this.selectModel).subscribe(result => {
              console.log(result)
              swal("Save Success!!", "บันทึกข้อมูลสมาชิก", "success");
              this.ngOnInit()
              this.childModal?.nativeElement.click()
            })
          } else if (this.action == 'edit') {
            this.userService.updateUser(this.selectModel.id , this.selectModel).subscribe(result => {
              console.log(result)
              swal("Update Success!!", "บันทึกข้อมูลสมาชิก", "success");
              this.ngOnInit()
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
      this.selectedItems.set(item.id, this.allSelected);
    });
    this.someSelected = this.itemsList.some(item => this.selectedItems.get(item.id));
  }

  onCheckboxChange(id: number) {
    const isSelected = this.selectedItems.get(id) || false;
    this.selectedItems.set(id, !isSelected);
    this.allSelected = this.itemsList.every(item => this.selectedItems.get(item.id));
    this.someSelected = this.itemsList.some(item => this.selectedItems.get(item.id));
  }

  deleteSelect() {
    let employeeInfo = '';
    this.selectedItems.forEach((isSelected, id) => {
      if (isSelected) {
        const user = this.itemsList.find(user => user.id === id);
        if (user) {
          employeeInfo += `${this.translate.instant('Fullname')}: ${user.name}\n`;
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
          this.selectedItems.forEach((isSelected, id) => {
            if (isSelected) {
              const user = this.itemsList.find(user => user.id === id);
              if (user) {
                this.userService.deleteUser(user.id).subscribe(result => {
                  swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
                  this.ngOnInit();
                });
              }
            }
          });
        }
      });
  }

  adjustSelect(status: boolean) {
    let title = "Are you sure?"
    let employeeInfo = ''; // ตัวแปรสำหรับเก็บข้อมูลพนักงาน
    this.selectedItems.forEach((isSelected, id) => {
      if (isSelected) {
        const user = this.itemsList.find(user => user.id === id);
        if (user) {
          employeeInfo += `${this.translate.instant('Fullname')}: ${user.name}\n`;
        }
      }
    });
    swal({
      title: title,
      text: employeeInfo,
      icon: "warning",
      dangerMode: false,
      buttons: ["Cancel", "Confirm"],
    })
      .then((willDelete: any) => {
        if (willDelete) {
          this.selectedItems.forEach((isSelected, id) => {
            if (isSelected) {
              const user = this.itemsList.find(user => user.id === id);
              if (user) {
                user.is_active = status
                this.userService.updateUser(user.id , user).subscribe(result => {
                  swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
                  this.ngOnInit();
                });
              }
            }
          });
        }

      });
  }

  filterEmp(empId: number) {
    this.selectModel = this.empList.filter(e => e.id == empId)[0]
  }

}
