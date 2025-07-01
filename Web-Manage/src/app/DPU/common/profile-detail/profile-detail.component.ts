// src/app/DPU/profile-edit/profile-edit.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { UserProfileModel } from '../../models/user.model';
import { AuthService } from '../../../shared/services/auth.service';
import { UserService } from '../../services/user.service';
import { TokenService } from '../../../shared/services/token.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FileItem, FileUploader, FileUploadModule, ParsedResponseHeaders } from 'ng2-file-upload';
import { environment } from '../../../../environments/environment';
import swal from 'sweetalert';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
// --- Local Imports ---

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    NgSelectModule,
    FormsModule,
    FileUploadModule
  ],
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.scss']
})
export class ProfileEditComponent implements OnInit {
  uploaderProfile: FileUploader | undefined;
  selectModel: UserProfileModel = new UserProfileModel()
  uploadErrorMsg: string = "";
  constructor(private userService: UserService, public translate: TranslateService, private tokenService: TokenService) {
    this.uploadConfig()
  }

  ngOnInit(): void {
    // this.selectModel = new UserProfileModel(this.tokenService.getUser());
    this.userService.getUserById(this.tokenService.getUser().id).subscribe(result => {
      this.selectModel = result;
      console.log("selectModel", this.selectModel);
    });
  }


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

          this.userService.updateUser(this.selectModel.id, this.selectModel).subscribe(result => {
            console.log(result)
            swal("Update Success!!", "บันทึกข้อมูลสมาชิก", "success");
            this.ngOnInit()
          })


        }

      });


  }

  reset() {
    this.ngOnInit()
  }
}
