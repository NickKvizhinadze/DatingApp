import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { AuthHttp } from 'angular2-jwt';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { User } from '../_models/User';
import { PaginatedResult } from './../_models/pagination';

@Injectable()
export class UserService {
    baseUrl = environment.apiUrl;
    constructor(private authHttp: AuthHttp) { }

    getUsers(page?: number, itemsPerPage?: number, userParams?: any) {
        const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();
        let queryString = '?';
        if (page != null && itemsPerPage != null) {
            queryString += `pageNumber=${page}&pageSize=${itemsPerPage}$`;
        }

        if (userParams) {
            queryString += `minAge=${userParams.minAge}&maxAge=` +
                `${userParams.maxAge}&gender=${userParams.gender}&orderBy=${userParams.orderBy}`;
        }
        return this.authHttp.get(`${this.baseUrl}users${queryString}`)
            .map((response: Response) => {
                paginatedResult.result = response.json();
                if (response.headers.get('Pagination') != null) {
                    paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
                }

                return paginatedResult;
            })
            .catch(this.handleError);
    }

    getUser(id): Observable<User> {
        return this.authHttp.
            get(this.baseUrl + 'users/' + id)
            .map(response => <User>response.json())
            .catch(this.handleError);
    }

    updateUser(id: number, user: User) {
        return this.authHttp
            .put(this.baseUrl + 'users/' + id, user)
            .catch(this.handleError);
    }

    setMainPhoto(userId: number, photoId: number) {
        return this.authHttp
            .post(`${this.baseUrl}users/${userId}/photos/${photoId}/setMain`, {})
            .catch(this.handleError);
    }

    deletePhoto(userId: number, photoId: number) {
        return this.authHttp
            .delete(`${this.baseUrl}users/${userId}/photos/${photoId}`, {})
            .catch(this.handleError);
    }

    private handleError(error: any) {
        const applicationError = error.headers.get('Application-Error');
        if (applicationError) {
            return Observable.throw(applicationError);
        }

        const serverError = error.json();
        let modelStateErrors = '';
        if (serverError) {
            for (const key in serverError) {
                if (serverError[key]) {
                    modelStateErrors += serverError[key] + '\n';
                }
            }
        }

        return Observable.throw(
            modelStateErrors || 'Server error'
        );
    }
}
