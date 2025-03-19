import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenService } from '../../shared/services/token.service';
import { CompanyService } from '../services/company.service';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-company-management',
  templateUrl: './company-management.component.html',
  styleUrls: ['./company-management.component.css']
})
export class InstallManagementComponent implements OnInit {
  projectId = ""
  constructor(private router: Router, private route: ActivatedRoute, private projectService: ProjectService, private tokenService: TokenService) {

  }

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('projectId')!;
    this.projectService.getById(this.projectId).subscribe(result => {
      console.log("SAVEEE")
      this.tokenService.saveSelectCompany(result);
      // this.router.navigate(["/company"]);
    })
  }
}
