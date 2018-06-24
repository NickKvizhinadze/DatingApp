import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { Message } from '../_models/Message';
import { User } from '../_models/User';
import { PaginatedResult } from './../_models/pagination';

@Injectable()
export class UserService {
    baseUrl = environment.apiUrl;
    constructor(private authHttp: HttpClient) { }

    getUsers(page?, itemsPerPage?, userParams?: any, likesParam?: string) {
        const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();
        let params = new HttpParams();


        if (page != null && itemsPerPage != null) {
            params = params.append('pageNumbe', page);
            params = params.append('pageSize', itemsPerPage);
        }


        if (likesParam === 'Likers') {
            params = params.append('likers', 'true');
        }

        if (likesParam === 'Likees') {
            params = params.append('likees', 'true');
        }

        if (userParams != null) {
            params = params.append('minAge', userParams.minAge);
            params = params.append('maxAge', userParams.maxAge);
            params = params.append('gender', userParams.gender);
            params = params.append('orderBy', userParams.orderBy);
        }

        return this.authHttp.get<User[]>(`${this.baseUrl}users`, { observe: 'response', params })
            .map(response => {
                paginatedResult.result = response.body;
                if (response.headers.get('Pagination') != null) {
                    paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
                }

                return paginatedResult;
            });
    }

    getUser(id): Observable<User> {
        return this.authHttp.
            get<User>(this.baseUrl + 'users/' + id);
    }

    updateUser(id: number, user: User) {
        return this.authHttp
            .put(this.baseUrl + 'users/' + id, user);
    }

    setMainPhoto(userId: number, photoId: number) {
        return this.authHttp
            .post(`${this.baseUrl}users/${userId}/photos/${photoId}/setMain`, {});
    }

    deletePhoto(userId: number, photoId: number) {
        return this.authHttp
            .delete(`${this.baseUrl}users/${userId}/photos/${photoId}`, {});
    }

    sendLike(id: number, recipientId: number) {
        return this.authHttp
            .post(`${this.baseUrl}users/${id}/like/${recipientId}`, {});
    }


    getLikeUsers(page?, itemsPerPage?, likesParam?: string) {
        const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();
        let params = new HttpParams();

        if (page != null && itemsPerPage != null) {
            params = params.append('pageNumber', page);
            params = params.append('pageSize', itemsPerPage);
        }

        if (likesParam === 'Likers') {
            params = params.append('likers', 'true');
        }

        if (likesParam === 'Likees') {
            params = params.append('likees', 'true');
        }

        return this.authHttp.get<User[]>(`${this.baseUrl}users/getUserLikes`, { observe: 'response', params })
            .map(response => {
                paginatedResult.result = response.body;
                if (response.headers.get('Pagination') != null) {
                    paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
                }

                return paginatedResult;
            });
    }

    getMessage(id: number, page?, itemsPerPage?, messageContainer?: string) {
        const paginatedResult: PaginatedResult<Message[]> = new PaginatedResult<Message[]>();

        let params = new HttpParams();
        params = params.append('MessageContainer', messageContainer);
        if (page != null && itemsPerPage != null) {
            params = params.append('pageNumber', page);
            params = params.append('pageSize', itemsPerPage);
        }

        return this.authHttp.get<Message[]>(`${this.baseUrl}users/${id}/messages`, { observe: 'response', params })
            .map(response => {
                paginatedResult.result = response.body;
                if (response.headers.get('Pagination') != null) {
                    paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
                }

                return paginatedResult;
            });
    }

    getMessageThread(id: number, recipientId: number) {
        return this.authHttp.get<Message[]>(`${this.baseUrl}/users/${id}/messages/thread/${recipientId}`);
    }

    sendMessage(id: number, message: Message) {
        return this.authHttp.post<Message>(`${this.baseUrl}users/${id}/messages`, message);
    }


    deleteMessage(id: number, userId: number) {
        return this.authHttp.post(`${this.baseUrl}users/${userId}/messages/${id}`, {});
    }

    markAsRead(userId: number, id: number) {
        return this.authHttp.post(`${this.baseUrl}users/${userId}/messages/${id}/read`, {})
            .subscribe();
    }
}
