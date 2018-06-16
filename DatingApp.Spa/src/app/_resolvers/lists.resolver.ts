import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { User } from '../_models/User';
import { AlertifyService } from '../_services/alertify.service';
import { UserService } from '../_services/user.service';

@Injectable()
export class ListsResolver implements Resolve<User> {
    pageNumber = 1;
    pageSize = 5;
    likesParam = 'Likers';

    constructor(
        private userService: UserService,
        private router: Router,
        private alertify: AlertifyService) {
    }

    resolve(route: ActivatedRouteSnapshot): Observable<User> {
        return this.userService.getLikeUsers(this.pageNumber, this.pageSize, this.likesParam).catch(error => {
            this.alertify.error('Problem retrieving data');
            this.router.navigate(['/members']);
            return Observable.of(null);
        });
    }
}
