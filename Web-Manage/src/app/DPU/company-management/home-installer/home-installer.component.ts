import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedModule } from '../../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '../../services/company.service';
import { TokenService } from '../../../shared/services/token.service';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-home-installer',
  templateUrl: './home-installer.component.html',
  standalone: true,
  imports: [CommonModule, SharedModule, NgApexchartsModule, TranslateModule],
  styleUrls: ['./home-installer.component.css']
})
export class HomeInstallerComponent implements OnInit {
  projectId = ""
  constructor(private router: Router, private route: ActivatedRoute, private projectService: ProjectService, private tokenService: TokenService) {
    this.projectId = this.route.snapshot.paramMap.get('projectId')!;
    this.projectService.getById(this.projectId).subscribe(result => {
      console.log("SAVEEE")
      this.tokenService.saveSelectCompany(result);
      // this.router.navigate(["/company"]);
    })
  }

  ngOnInit() {

  }

}
