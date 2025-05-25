import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, Payment, ReservationModel } from '../../models/all.model';
import { DROPZONE_CONFIG, DropzoneConfigInterface, DropzoneModule } from 'ngx-dropzone-wrapper';
import { environment } from '../../../../environments/environment';
import { FileItem, FileUploader, ParsedResponseHeaders } from 'ng2-file-upload';
import { TokenService } from '../../../shared/services/token.service';
import swal from 'sweetalert';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  // Change this to your upload POST address:
  url: environment.baseUrl + "/api/upload-image",
  acceptedFiles: 'image/*',
  createImageThumbnails: true
};
@Component({
  selector: 'app-view-bill',
  standalone: true,
  imports: [CommonModule, DropzoneModule],
  providers: [{
    provide: DROPZONE_CONFIG,
    useValue: DEFAULT_DROPZONE_CONFIG
  }],
  templateUrl: './view-bill.component.html',
})
export class ViewBillComponent {
  public type: string = 'component';

  public disabled: boolean = false;

  public config: DropzoneConfigInterface = {
    clickable: true,
    maxFiles: 1,
    autoReset: null,
    errorReset: null,
    cancelReset: null,
    maxFilesize: 1
  };
  @Input() reservation!: ReservationModel;
  @Output() uploadSlip = new EventEmitter<ReservationModel>();
  @Output() checkOut = new EventEmitter<ReservationModel>();
  selectedFile?: File;
  uploaderSlip: FileUploader | undefined;
  uploadErrorMsg: string = "";
  urlLink = environment.baseUrl + "/images/"
  constructor(private tokenService: TokenService) {
    // this.uploadConfig()
  }

  uploadConfig() {

    this.uploaderSlip = new FileUploader({
      url: environment.baseUrl + "/api/upload-image",
      isHTML5: true,
      authToken: this.tokenService.getToken()!,
    });

    this.uploaderSlip.onAfterAddingFile = (fileItem: FileItem) => {
      fileItem.withCredentials = false;
      this.uploadErrorMsg = "";

      while (this.uploaderSlip!.queue.length > 1) {
        this.uploaderSlip!.queue[0].remove();
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

    this.uploaderSlip.onCompleteItem = (
      item: FileItem,

 response: string,
      status: number,
      headers: ParsedResponseHeaders
    ) => {
      if (item.isSuccess) {
        const res = JSON.parse(response);
        console.log("res", res);
        this.reservation.payments[0].slip_url = res.filename
        swal(res.message, "บันทึกสำเร็จ", "success");

      } else {
        this.uploadErrorMsg = "cannot upload file.";
        swal("Opp!!", "ไม่สามารถอัพโหลดได้", "info");
      }
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)
    // update form when @Input changes (ไม่ต้อง reset ทั้ง form)
    if (changes['reservation'] && changes['reservation'].currentValue) {
      this.reservation = changes['reservation'].currentValue
    }

  }

  getTotalAmount() {
    return this.reservation.orders
      .reduce((total, order) => total + Number(order.total_amount || 0), 0);
  }

  getAllOrderItems() {
    return this.reservation.orders?.flatMap(order => order.order_items || []) || [];
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  submitSlip() {
    this.uploadSlip.emit(this.reservation);
  }

  checkBill() {
    this.checkOut.emit(this.reservation);
  }

  public onUploadInit(args: any): void {
    console.log('onUploadInit:', args);
  }

  public onUploadError(args: any): void {
    console.log('onUploadError:', args);
  }

  public onUploadSuccess(args: any): void {
    console.log('onUploadSuccess:', args);
    this.reservation.payments[0].slip_url = args[1].filename
  }
}
