import { PaginatedResult } from './../../_models/pagination';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Pagination } from '../../_models/pagination';
import { User } from '../../_models/User';
import { AlertifyService } from '../../_services/alertify.service';
import { UserService } from './../../_services/user.service';

@Component({
  selector: 'member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
  users: User[];
  pagination: Pagination;
  constructor(private userService: UserService, private route: ActivatedRoute, private alertify: AlertifyService) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.users = data['users'].result;
      debugger;
      this.pagination = data['users'].pagination;
    });
  }

  loadUser() {
    this.userService.getUsers(this.pagination.currentPage, this.pagination.itemsPerPage)
      .subscribe((res: PaginatedResult<User[]>) => {
        this.users = res.result;
        this.pagination = res.pagination;
      }, error => this.alertify.error(error));
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadUser();
  }

}
