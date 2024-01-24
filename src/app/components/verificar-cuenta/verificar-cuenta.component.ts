import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';

@Component({
  selector: 'app-verificar-cuenta',
  templateUrl: './verificar-cuenta.component.html',
  styleUrls: ['./verificar-cuenta.component.css']
})
export class VerificarCuentaComponent implements OnInit {
  public token = ''
  public load =true
  public msm =''

  constructor(private _router:ActivatedRoute,private _clienteService:ClienteService){

  }
ngOnInit(): void {
    this._router.params.subscribe(params =>{
      this.token = params['token'];
      if (this.token) {
        this.load= true
        this._clienteService.validar_correo_verificacion(this.token).subscribe(response=>{
          if (response.data != undefined) {
            console.log(response);

              this.msm="La cuenta fue verificada correctamente"
          }else{
             this.msm=response.message
          }
          this.load =false

        })
      }

    })
}

}
