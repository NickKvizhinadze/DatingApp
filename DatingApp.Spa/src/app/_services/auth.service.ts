import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { User } from './../_models/User';
import { AuthUser } from '../_models/AuthUser';

@Injectable()
export class AuthService {
    baseUrl = 'http://localhost:48200/api/auth/';
    userToken: any;
    currentUser: User;
    decodedToken: any;
    private photoUrl = new BehaviorSubject<string>('../../assets/user.png');
    currentPhotoUrl = this.photoUrl.asObservable();

    constructor(private http: HttpClient, private jwtHelperService: JwtHelperService) { }

    changeMemberPhoto(photoUrl: string) {
        this.photoUrl.next(photoUrl);
    }

    login(model: any) {
        return this.http.post<AuthUser>(this.baseUrl + 'login', model, {
            headers: new HttpHeaders()
                .set('Content-Type', 'application/json')
        })
            .map(user => {
                if (user) {
                    localStorage.setItem('token', user.token);
                    localStorage.setItem('user', JSON.stringify(user.user));
                    this.decodedToken = this.jwtHelperService.decodeToken(user.token);
                    this.userToken = user.token;
                    this.currentUser = user.user;
                    if (this.currentUser.photoUrl !== null) {
                        this.changeMemberPhoto(this.currentUser.photoUrl);
                    } else {
                        this.changeMemberPhoto('../../assets/user.png');
                    }
                }
            });
    }

    register(model: User) {
        return this.http.post(this.baseUrl + 'register', model, {
            headers: new HttpHeaders()
                .set('Content-Type', 'application/json')
        });
    }

    loggedIn() {
        const token = this.jwtHelperService.tokenGetter();
        if (!token) {
            return false;
        }

        return !this.jwtHelperService.isTokenExpired(token);
    }
}
