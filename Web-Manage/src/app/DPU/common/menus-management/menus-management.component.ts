import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { FormsModule } from "@angular/forms";
import swal from 'sweetalert';
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { SharedModule } from "../../../shared/shared.module";
import { UserProfileModel } from "../../models/user.model";
import { UserService } from "../../services/user.service";
import { TokenService } from "../../../shared/services/token.service";
import { FileUploadModule } from 'ng2-file-upload';
import { FileItem, FileUploader, ParsedResponseHeaders } from "ng2-file-upload";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { MenuService } from "ngx-editor/lib/modules/menu/menu.service";
import { MenusService } from "../../services/menu.service";
import { MenusModel } from "../../models/all.model";


@Component({
  selector: 'app-menus-management',
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
  templateUrl: './menus-management.component.html',
  styleUrl: './menus-management.component.scss'
})
export class MenusManagementComponent {
  @ViewChild('closeModal') public childModal?: ElementRef;
  @ViewChild('closeModalStock') public closeModalStock?: ElementRef;
  @ViewChild('modalDetail') public modalDetail?: ElementRef;
  allSelected = false;
  someSelected = false;
  uploaderProfile: FileUploader | undefined;
  uploadErrorMsg: string = "";
  itemsList: MenusModel[] = []
  filterList: MenusModel[] = []
  selectModel: MenusModel = new MenusModel({})
  selectedItems = new Map<string, boolean>();
  pageIndex = 0;
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
  isEdit = false;
  constructor(private http: HttpClient, private menuService: MenusService, public translate: TranslateService, private tokenService: TokenService) {
    this.uploadConfig()
    this.projectId = this.tokenService.getSelectCompany().projectId!;
  }

  @ViewChild('video') video: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  capturedImage: string | null = null;
  uploadStatus: string = '';
  checkMatch = false;
  memberId = ""
  isFaceDetected = false; // Flag to determine if a face is detected
  categorySelected = 'all'

  uploadConfig() {
    this.uploaderProfile = new FileUploader({
      url: environment.baseUrl + "/api/files/upload-image",
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
    this.menuService.getLists().subscribe(result => {
      this.itemsList = result
      this.updatePagedItems()
    })
  }

  filter(v: string) {
    this.pageIndex = 0;
    return this.itemsList?.filter(
      (x) =>
        x.name.toLowerCase().indexOf(v.toLowerCase()) !== -1 ||
        x.description?.toLowerCase().indexOf(v.toLowerCase()) !== -1
    );
  }

  delete(item: MenusModel) {
    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",

      dangerMode: true,
      buttons: ["Cancel", "Yes,Delete it!"],
    })
      .then((willDelete: any) => {
        if (willDelete) {
          this.menuService.delete(item).subscribe(result => {
            swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
            this.ngOnInit()
          })
        }

      });
  }

  new() {
    this.isEdit = false
    this.selectModel = new MenusModel({})
  }

  view(item: MenusModel) {
    console.log(item)
    this.isEdit = true;
    this.selectModel = item
  }

  save() {
    console.log(this.selectModel)
    swal({
      title: "Are you sure?",
      text: "คุณต้องการบันทึกหรือไม่",
      icon: "warning",
      dangerMode: false,
      buttons: ["Cancel", "Confirm"],
    })
      .then((willDelete: any) => {
        if (willDelete) {
          if (!this.isEdit) {
            this.menuService.save(this.selectModel).subscribe(result => {
              swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
              this.ngOnInit()
              this.childModal?.nativeElement.click()
            })
          } else {
            this.menuService.update(this.selectModel).subscribe(result => {
              swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
              this.ngOnInit()
              this.childModal?.nativeElement.click()
            })

          }
          // this.selectModel.member.role = 0

        }

      });


  }

  updateEmp() {
    swal({
      title: "Are you sure?",
      text: "คุณต้องการบันทึกหรือไม่",
      icon: "warning",
      dangerMode: false,
      buttons: ["Cancel", "Confirm"],
    })
      .then((willDelete: any) => {
        if (willDelete) {
          this.menuService.save(this.selectModel).subscribe(result => {
            swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
            this.ngOnInit()
            this.childModal?.nativeElement.click()
          })
        }

      });


  }

  // filterEmp(empId: string) {
  //   this.selectModel.supervisor = this.itemsList.filter(e => e.employeeId == empId)[0]
  // }

  updatePagedItems() {
    const startIndex = this.pageIndex * 10;
    const endIndex = startIndex + 10;
    // this.filterList = this.itemsList.slice(startIndex, endIndex);
    this.filterList = this.itemsList
  }

  changeCategoly() {
    console.log(this.categorySelected)
    if (this.categorySelected != 'all') {
      this.filterList = this.itemsList.filter(e => e.category_id == this.categorySelected)
    } else {
      this.filterList = this.itemsList
    }
  }
}
