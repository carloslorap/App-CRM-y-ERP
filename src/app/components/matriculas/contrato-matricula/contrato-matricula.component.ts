import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatriculaService } from 'src/app/services/matricula.service';

@Component({
  selector: 'app-contrato-matricula',
  templateUrl: './contrato-matricula.component.html',
  styleUrls: ['./contrato-matricula.component.css']
})
export class ContratoMatriculaComponent implements OnInit{
  public token = localStorage.getItem('token');
  public id =''
  public load_data= true
  public data = false

  public matricula :any={}

  constructor(private _matriculaService:MatriculaService,private _route:ActivatedRoute){}


  ngOnInit(): void {
    this._route.params.subscribe(params=>{
      this.id = params['id'];
      this._matriculaService.obtener_matricula_admin(this.id,this.token).subscribe(response=>{
        console.log(response);
        if (response.data == undefined) {
            this.data = false
        }else{
          this.data = true
          this.matricula = response.data

        }
        this.load_data = false
      })
    })
  }

}
