import { Component, OnInit } from '@angular/core';
import { TestService } from 'src/app/services/test.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  public token : any =localStorage.getItem('token');
  public background = ''

  constructor( private _testService:TestService){
    this.init_config()
  }

  ngOnInit(): void {

  }

  init_config(){
    this._testService.obtener_configuracion_general(this.token).subscribe(response=>{
        this.background = response.data.background
    })
  }
}
