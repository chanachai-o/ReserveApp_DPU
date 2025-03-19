import { Component, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import swal from 'sweetalert';
import { CompanyService } from '../../services/company.service';
import { MatPaginator } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'ng2-file-upload';
import { FileItem, FileUploader, ParsedResponseHeaders } from "ng2-file-upload";
import { environment } from '../../../../environments/environment';
import { TokenService } from '../../../shared/services/token.service';
import { ProjectService } from '../../services/project.service';
import { ProjectModel } from '../../models/project.model';

@Component({
  selector: 'app-company-manage',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    NgSelectModule,
    FormsModule,
    MatPaginator,
    RouterModule,
    FileUploadModule
  ],
  templateUrl: './company-manage.component.html',
  styleUrl: './company-manage.component.css',
})
export class CompanyManageComponent {
  @ViewChild('closeModal') public childModal?: ElementRef;
  @ViewChild('modalDetail') public modalDetail?: ElementRef;
  action = "new";
  allSelected = false;
  someSelected = false;
  itemsList: ProjectModel[] = []
  filterList: ProjectModel[] = []
  selectModel: ProjectModel = new ProjectModel()
  selectedItems = new Map<string, boolean>();
  empList: ProjectModel[] = []
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
  constructor(private projectService: ProjectService, public translate: TranslateService, private tokenService: TokenService) {
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
    this.projectService.getLists().subscribe(result => {
      this.itemsList = result
      this.updatePagedItems()
    })
  }

  filter(v: string) {
    return this.itemsList?.filter(
      (x) =>
        x.projectId?.toLowerCase().indexOf(v.toLowerCase()) !== -1 ||
        x.project_name?.toLowerCase().indexOf(v.toLowerCase()) !== -1 ||
        x.project_desc?.toLowerCase().indexOf(v.toLowerCase()) !== -1
    );
  }

  delete(item: ProjectModel) {
    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",

      dangerMode: true,
      buttons: ["Cancel", "Yes,Delete it!"],
    })
      .then((willDelete: any) => {
        if (willDelete) {
          this.projectService.delete(item).subscribe(result => {
            swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
            this.ngOnInit()
          })
        }

      });
  }

  new() {
    this.action = 'add'
    this.selectModel = new ProjectModel()
    this.selectModel.picture = ""
  }

  view(item: ProjectModel) {
    this.action = 'edit'
    this.selectModel = new ProjectModel(item)
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
            this.projectService.save(this.selectModel).subscribe(result => {
              console.log(result)
              swal("Save Success!!", "บันทึกข้อมูลสมาชิก", "success");
              this.ngOnInit()
              this.childModal?.nativeElement.click()
            })
          } else if (this.action == 'edit') {
            this.projectService.update(this.selectModel).subscribe(result => {
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
      this.selectedItems.set(item.projectId!, this.allSelected);
    });
    this.someSelected = this.itemsList.some(item => this.selectedItems.get(item.projectId!));
  }

  onCheckboxChange(projectId: string) {
    const isSelected = this.selectedItems.get(projectId) || false;
    this.selectedItems.set(projectId, !isSelected);
    this.allSelected = this.itemsList.every(item => this.selectedItems.get(item.projectId!));
    this.someSelected = this.itemsList.some(item => this.selectedItems.get(item.projectId!));
  }

  deleteSelect() {
    let employeeInfo = '';
    this.selectedItems.forEach((isSelected, projectId) => {
      if (isSelected) {
        const item = this.itemsList.find(item => item.projectId === projectId);
        if (item) {
          employeeInfo += `${this.translate.instant('บริษัท')}: ${item.project_name}\n`;
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
          this.selectedItems.forEach((isSelected, projectId) => {
            if (isSelected) {
              const item = this.itemsList.find(item => item.projectId === projectId);
              if (item) {
                this.projectService.delete(item).subscribe(result => {
                  swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
                  this.ngOnInit();
                });
              }
            }
          });
        }
      });
  }

  // adjustSelect(status: number) {
  //   let title = "Are you sure?"
  //   let employeeInfo = ''; // ตัวแปรสำหรับเก็บข้อมูลพนักงาน
  //   this.selectedItems.forEach((isSelected, memberId) => {
  //     if (isSelected) {
  //       const company = this.itemsList.find(project => project.projectId === memberId);
  //       if (project) {
  //         employeeInfo += `${this.translate.instant('Fullname')}: ${project.projectName}\n`;
  //       }
  //     }
  //   });
  //   swal({
  //     title: title,
  //     text: employeeInfo,
  //     icon: "warning",
  //     dangerMode: false,
  //     buttons: ["Cancel", "Confirm"],
  //   })
  //     .then((willDelete: any) => {
  //       if (willDelete) {
  //         this.selectedItems.forEach((isSelected, projectId) => {
  //           if (isSelected) {
  //             const project = this.itemsList.find(project => project.projectId === projectId);
  //             if (project) {
  //               project.status = status
  //               this.projectService.update(project).subscribe(result => {
  //                 swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
  //                 this.ngOnInit();
  //               });
  //             }
  //           }
  //         });
  //       }

  //     });
  // }

}
