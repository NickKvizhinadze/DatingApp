import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'nav-bar',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {};

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  login() {
    this.authService.login(this.model).subscribe(data => {
      console.log('logged in successfully');
    }, error => {
      console.log('failed to login');
    });
  }


  logout() {
    this.authService.userToken = null;
    localStorage.removeItem('token');
  }

  loggedIn() {
    const token = localStorage.getItem('token');
    return !!token;
  }

}
