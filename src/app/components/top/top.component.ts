import { Component, OnInit } from '@angular/core';
import { TestService } from 'src/app/services/test.service';

@Component({
  selector: 'app-top',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.css']
})
export class TopComponent {

  public token : any =localStorage.getItem('token');
  public user:any={}
  public background = ''

  constructor(private _testService:TestService){
    let str_user:any = localStorage.getItem('user');
    this.user = JSON.parse(str_user)
    this.init_config()
  }

  OnInit():void {

  }
  logout(){
    localStorage.clear()
    window.location.reload()
  }


  init_config(){
    this._testService.obtener_configuracion_general(this.token).subscribe(response=>{
        this.background = response.data.background
    })
  }
}
