import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FileUploadModule, FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';
import { environment } from '../../../../environments/environment';
import { TokenService } from '../../../shared/services/token.service';
import { SharedModule } from '../../../shared/shared.module';
import { TablesService } from '../../services/tables.service';

import swal from 'sweetalert';
import { RoomModel, TablesModel } from '../../models/menus.model';
import { StoreProfile, StoreProfileService } from '../../services/store-profile.service';
import { TableReservationComponent } from '../table-reservation/table-reservation.component';
import { AvailableItem, Table } from '../../models/all.model';
@Component({
  selector: 'app-reserved-room-tables',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    NgSelectModule,
    FormsModule,
    MatPaginator,
    FileUploadModule,
    TableReservationComponent
  ],
  templateUrl: './reserved-room-tables.component.html',
  styleUrl: './reserved-room-tables.component.scss'
})
export class ReservedRoomTablesComponent {
  @ViewChild('closeModal') public childModal?: ElementRef;
  @ViewChild('closeModalStock') public closeModalStock?: ElementRef;
  @ViewChild('modalDetail') public modalDetail?: ElementRef;
  allSelected = false;
  someSelected = false;
  uploaderProfile: FileUploader | undefined;
  uploadErrorMsg: string = "";
  itemsList: AvailableItem[] = []
  filterList: AvailableItem[] = []
  selectModel: any
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
  selectedTable?: AvailableItem
  isEdit = false;
  storeModel: StoreProfile
  constructor(private http: HttpClient, private tableService: TablesService, public translate: TranslateService, private tokenService: TokenService, private storeService: StoreProfileService) {
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
    this.storeService.getProfile().subscribe(result => {
      ;
      this.storeModel = result
      console.log("storeModel", this.storeModel)
    })
    this.tableService.getActiveList().subscribe(result => {
      this.itemsList = result
      this.updatePagedItems()
    })
  }

  filter(v: string) {
    this.pageIndex = 0;
    const search = v.trim().toLowerCase();
    return this.itemsList?.filter(x =>
      // โต๊ะ: ค้นหาเลขโต๊ะ, สถานะ, ชื่อ
      (x.table_number?.toLowerCase().includes(search)) ||
      // ห้อง: ค้นหาเลขห้อง, ชื่อห้อง
      (x.room_number?.toLowerCase().includes(search)) ||
      (x.name?.toLowerCase().includes(search)) ||
      (x.status?.toLowerCase().includes(search)) ||
      (x.description?.toLowerCase().includes(search))
    );
  }

  delete(item: TablesModel) {
    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",

      dangerMode: true,
      buttons: ["Cancel", "Yes,Delete it!"],
    })
      .then((willDelete: any) => {
        if (willDelete) {
          this.tableService.delete(item).subscribe(result => {
            swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
            this.ngOnInit()
          })
        }

      });
  }

  new() {
    this.isEdit = false
    this.selectModel = new TablesModel()
  }

  view(item: TablesModel) {
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
            this.tableService.save(this.selectModel).subscribe(result => {
              swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
              this.ngOnInit()
              this.childModal?.nativeElement.click()
            })
          } else {
            this.tableService.update(this.selectModel).subscribe(result => {
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
          this.tableService.save(this.selectModel).subscribe(result => {
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

  reserveTable(item: any) {
    console.log('API', item);
    console.log('selectModel', this.selectedTable);
    if(this.selectedTable && this.selectedTable.capacity < item.num_people) {
      swal("Error!!", "จำนวนคนที่จองเกินกว่าความจุของโต๊ะ/ห้อง", "error");
      return;
    }
    item.status = 'pending'
    item.end_time = item.start_time
    delete item.room_id
    this.http.post("http://127.0.0.1:8000/reservations", item).subscribe(result => {
      console.log(result)
      this.tableService.reserve(item.table_id).subscribe(result => {
        swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
        this.ngOnInit()
      })
    })
  }
}
