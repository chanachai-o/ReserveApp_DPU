import { BorrowTransactionsService } from './../../services/borrow-transactions.service';
import { ProjectEquipmentService } from './../../services/project-equipments.service';
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
import { EquipmentModel, EquipmentStockModel } from "../../models/equipments.model";
import { EquipmentService } from "../../services/equirement.service";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ProjectEquipmentModel } from '../../models/project-equipments';
import { BorrowTransactionsModel } from '../../models/borrow-transactions';
import { ProjectMemberModel } from '../../models/project-members';
import { ProjectMemberService } from '../../services/project-members.service';

@Component({
  selector: 'app-admin-project-equirement',
  standalone: true,
  imports: [CommonModule,
    SharedModule,
    TranslateModule,
    NgSelectModule,
    FormsModule,
    MatPaginator,
    FileUploadModule],
  templateUrl: './admin-project-equirement.component.html',
  styleUrl: './admin-project-equirement.component.scss'
})
export class AdminProjectEquirementComponent {

  @ViewChild('closeModal') public childModal?: ElementRef;
  @ViewChild('closeModalStock') public closeModalStock?: ElementRef;
  @ViewChild('modalDetail') public modalDetail?: ElementRef;
  allSelected = false;
  someSelected = false;
  uploaderProfile: FileUploader | undefined;
  uploadErrorMsg: string = "";
  itemsList: ProjectEquipmentModel[] = []
  filterList: ProjectEquipmentModel[] = []

  itemsListAll: EquipmentModel[] = []
  filterListAll: EquipmentModel[] = []

  selectModel: ProjectEquipmentModel = new ProjectEquipmentModel()
  selectStock?: EquipmentStockModel
  selectedItems = new Map<string, boolean>();
  borrowSelect: BorrowTransactionsModel = new BorrowTransactionsModel()
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
  empList: ProjectMemberModel[] = []
  hisList: BorrowTransactionsModel[] = []
  constructor(private http: HttpClient, private eqService: EquipmentService, public translate: TranslateService, private tokenService: TokenService, private projectEquipmentService: ProjectEquipmentService, private borrowTransactionsService: BorrowTransactionsService, private projectMemberService: ProjectMemberService) {
    this.projectId = this.tokenService.getSelectCompany().projectId!;
  }

  @ViewChild('video') video: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  capturedImage: string | null = null;
  uploadStatus: string = '';
  checkMatch = false;
  memberId = ""
  isFaceDetected = false; // Flag to determine if a face is detected


  ngOnInit(): void {
    this.getCompanyEquirment()
    this.getProjectEquirment()
    this.getUserProject()
  }

  getUserProject() {
    this.projectMemberService.getLists(this.projectId).subscribe(result => {
      this.empList = result
    })
  }

  getCompanyEquirment() {
    this.eqService.getLists().subscribe(result => {
      this.itemsListAll = result.filter(e => e.quantity > 0)
      this.updatePagedItemsAll()
    })
  }

  getProjectEquirment() {
    this.projectEquipmentService.getLists(this.projectId).subscribe(result => {
      this.itemsList = result
      this.updatePagedItems()
    })
  }

  filter(v: string) {
    this.pageIndex = 0;
    return this.itemsList?.filter(
      (x) =>
        x.equipment.equipmentName.toLowerCase().indexOf(v.toLowerCase()) !== -1 ||
        x.equipment.description?.toLowerCase().indexOf(v.toLowerCase()) !== -1
    );
  }

  delete(item: EquipmentModel) {
    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",

      dangerMode: true,
      buttons: ["Cancel", "Yes,Delete it!"],
    })
      .then((willDelete: any) => {
        if (willDelete) {
          this.eqService.delete(item).subscribe(result => {
            swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
            this.ngOnInit()
          })
        }

      });
  }

  // new() {
  //   this.isEdit = false
  //   this.selectModel = new EquipmentModel()
  // }

  // view(item: EquipmentModel) {
  //   console.log(item)
  //   this.isEdit = true;
  //   this.selectModel = item
  // }

  viewStock(item: ProjectEquipmentModel) {
    this.selectModel = new ProjectEquipmentModel(item)
    this.borrowSelect = new BorrowTransactionsModel()
    // this.selectStock = new EquipmentStockModel()
    // this.selectStock.equipmentId = this.selectModel.equipmentId
    // this.selectStock.created_by = this.tokenService.getUser().member.memberId
    // this.selectStock.action = "INBOUND"
  }

  viewHisStock(item: ProjectEquipmentModel) {
    this.borrowTransactionsService.search({ "peId": item.peId }).subscribe(result => {
      this.hisList = result
    })
  }

  // save() {
  //   console.log(this.selectModel)
  //   swal({
  //     title: "Are you sure?",
  //     text: "คุณต้องการบันทึกหรือไม่",
  //     icon: "warning",
  //     dangerMode: false,
  //     buttons: ["Cancel", "Confirm"],
  //   })
  //     .then((willDelete: any) => {
  //       if (willDelete) {
  //         if (!this.isEdit) {
  //           this.eqService.save(this.selectModel).subscribe(result => {
  //             swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
  //             this.ngOnInit()
  //             this.childModal?.nativeElement.click()
  //           })
  //         } else {
  //           this.eqService.update(this.selectModel).subscribe(result => {
  //             swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
  //             this.ngOnInit()
  //             this.childModal?.nativeElement.click()
  //           })

  //         }
  //         // this.selectModel.member.role = 0

  //       }

  //     });


  // }


  // filterEmp(empId: string) {
  //   this.selectModel.supervisor = this.itemsList.filter(e => e.employeeId == empId)[0]
  // }

  updatePagedItems() {
    const startIndex = this.pageIndex * 10;
    const endIndex = startIndex + 10;
    // this.filterList = this.itemsList.slice(startIndex, endIndex);
    this.filterList = this.itemsList
  }

  updatePagedItemsAll() {
    const startIndex = this.pageIndex * 10;
    const endIndex = startIndex + 10;
    // this.filterList = this.itemsList.slice(startIndex, endIndex);
    this.filterListAll = this.itemsListAll
  }

  saveBorrow() {
    // console.log(this.selectStock)
    swal({
      title: "Are you sure?",
      text: "คุณต้องการบันทึกหรือไม่",
      icon: "warning",
      dangerMode: false,
      buttons: ["Cancel", "Confirm"],
    })
      .then((willDelete: any) => {
        if (willDelete) {
          this.borrowTransactionsService.save({
            "peId": this.selectModel.peId,
            "quantity_borrowed": this.borrowSelect.quantity_borrowed,
            "status": "approved",
            "memberId": this.borrowSelect.memberId,
            "approved_by": this.tokenService.getUser().member.memberId
          }).subscribe(result => {
            swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
            this.ngOnInit()
            this.closeModalStock?.nativeElement.click()
          }, (error: any) => {
            swal("Fail!!", error.error.detail, "info");
          })
        }

      });


  }

  stock(item: EquipmentModel) {
    if (item.quantity > 0) {
      swal({
        title: "Are you sure?",
        text: "คุณต้องการบันทึกหรือไม่",
        icon: "warning",
        dangerMode: false,
        buttons: ["Cancel", "Confirm"],
      })
        .then((willDelete: any) => {
          if (willDelete) {
            this.projectEquipmentService.save({
              "quantity_in_project": item.quantity,
              "projectId": this.projectId,
              "equipmentId": item.equipmentId
            }).subscribe(result => {
              this.selectStock = new EquipmentStockModel()
              this.selectStock.quantity = item.quantity
              this.selectStock.equipmentId = item.equipmentId
              this.selectStock.created_by = this.tokenService.getUser().member.memberId
              this.selectStock.action = "OUTBOUND",
                this.selectStock.remark = "ย้ายเข้าสู่โครงการ " + this.tokenService.getSelectCompany().projectId + " (" + this.tokenService.getSelectCompany().project_code + ")"
              this.eqService.stock(this.selectStock!).subscribe(result => {
                swal("Save Success!!", "บันทึกข้อมูลสำเร็จ", "success");
                this.getProjectEquirment()
                this.getCompanyEquirment()
                this.childModal?.nativeElement.click()
              })

            })
          }

        });
    }
  }
}

