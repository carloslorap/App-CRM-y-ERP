import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { MatriculaService } from 'src/app/services/matricula.service';
declare var $: any;
declare var moment: any;
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { mkConfig, generateCsv, download } from "export-to-csv";

@Component({
  selector: 'app-index-matricula',
  templateUrl: './index-matricula.component.html',
  styleUrls: ['./index-matricula.component.css']
})
export class IndexMatriculaComponent  implements OnInit{
  public token = localStorage.getItem('token');
  public matriculas :Array<any>=[]
  public matriculas_const :Array<any>=[]
  public asesores :Array<any>=[]
  public load_data= false
  public btn_mail = false
  public load_cancel = false;

  public inicio =''
  public hasta =''

  public page = 1;
  public pageSize = 7;

  public user:any={}

  public asesor = 'Todos'

  public arr_json :Array<any>=[]
  public csvConfig = mkConfig({ useKeysAsHeaders: true });


  public tipo_filtro = ''
  public interruptor_form = 'input'
  public filtro_valor =''

  public comentarios:Array<any>=[]
  public load_comentarios = false


  constructor(private _clienteService:ClienteService,private _matriculaService:MatriculaService,private _colaboradorService:ColaboradorService,private _router:Router,private _route:ActivatedRoute){
    let user_lc:any = localStorage.getItem('user')
    this.user = JSON.parse(user_lc)
  }


  ngOnInit(): void {
    setTimeout(() => {
      $('.selectpicker').selectpicker();
    }, 150);
    this.init_asesores()
    this._route.queryParams.subscribe((params:Params) => {
      this.inicio = params['inicio'];
      this.hasta = params['hasta'];
      this.asesor = params['asesor'];
      if ( this.inicio&&this.hasta&&this.asesor) {
        this.init_matriculas_fecha()
      }else{
        this.asesor = 'Todos'
        this.init_matriculas_hoy()
      }
    })


  }


  init_matriculas_hoy(){
    this.load_data = true
    this._matriculaService.obtener_matriculas_hoy(this.token).subscribe(response=>{
      this.matriculas = response.data
      this.matriculas_const = this.matriculas
      this.load_data = false
    })
  }



  init_matriculas_fecha(){
    this.load_data = true
    this._matriculaService.obtener_matriculas_fechas(this.inicio,this.hasta,this.asesor,this.token).subscribe(response=>{
      this.matriculas = response.data
      this.matriculas_const = this.matriculas
      this.load_data = false
    })
  }

  filtrar(){
    if (!this.inicio) {
      $.notify('Ingrese la fecha de inicio', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: {
          from: 'top',
          align: 'right',
        },
        delay: 1000,
        animate: {
          enter: 'animated ' + 'bounce',
          exit: 'animated ' + 'bounce',
        },
      });
    }else if(!this.hasta){
      $.notify('Ingrese la fecha fin', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: {
          from: 'top',
          align: 'right',
        },
        delay: 1000,
        animate: {
          enter: 'animated ' + 'bounce',
          exit: 'animated ' + 'bounce',
        },
      });

    }else if(!this.asesor){
      $.notify('Seleccione el asesor', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: {
          from: 'top',
          align: 'right',
        },
        delay: 1000,
        animate: {
          enter: 'animated ' + 'bounce',
          exit: 'animated ' + 'bounce',
        },
      });
    }else{
      this._router.navigate(['/matriculas'],{queryParams:{inicio:this.inicio,hasta:this.hasta,asesor:this.asesor}})
    }

  }

  init_asesores() {
    this._colaboradorService
      .listar_asesores_admin(this.token)
      .subscribe((response) => {
        this.asesores = response.data;
        setTimeout(() => {
          $('.selectpicker').selectpicker('refresh');
        }, 150);
      });
  }

  enviar_orden(id:any){
    this._matriculaService.send_voice(id,this.token).subscribe((response) => {

      $.notify('Se envio correctamente la orden', {
        type: 'success',
        spacing: 10,
        timer: 2000,
        placement: {
          from: 'top',
          align: 'right',
        },
        delay: 1000,
        animate: {
          enter: 'animated ' + 'bounce',
          exit: 'animated ' + 'bounce',
        },
      });
      $('#resendmail-'+id).modal('hide')
    })
  }

  cancelar_matricula(id:any){
    this.load_cancel=true
    this._matriculaService.cancelar_matricula_admin(id,this.token).subscribe(response=>{
      if (response.data != undefined) {
        console.log(response)
        $.notify('Se cancelo la matricula correctamente', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: {
            from: 'top',
            align: 'right',
          },
          delay: 1000,
          animate: {
            enter: 'animated ' + 'bounce',
            exit: 'animated ' + 'bounce',
          },
        });
        this.load_cancel=false
        $('#delete-'+id).modal('hide')

        if ( this.inicio&&this.hasta&&this.asesor) {
          this.init_matriculas_fecha()
        }else{
          this.asesor = 'Todos'
          this.init_matriculas_hoy()
        }
      }else{
        $.notify(response.message, {
          type: 'warning',
          spacing: 10,
          timer: 2000,
          placement: {
            from: 'top',
            align: 'right',
          },
          delay: 1000,
          animate: {
            enter: 'animated ' + 'bounce',
            exit: 'animated ' + 'bounce',
          },
        });
        this.load_cancel=false
        $('#delete-'+id).modal('hide')
      }
    })
  }


  obtener_tipo_filtro(){
    if (this.tipo_filtro == 'canal') {
        this.interruptor_form = 'select'
    }else{
      this.interruptor_form = 'input'
    }
  }

  buscador_avanzado(){
    if (this.tipo_filtro) {
      if (this.tipo_filtro == 'codigo') {
        let term = new RegExp(this.filtro_valor,'i');
        this.matriculas = this.matriculas_const.filter(item => term.test(item._id))
      }else if(this.tipo_filtro == 'nombres'){
        let term = new RegExp(this.filtro_valor,'i');
        this.matriculas = this.matriculas_const.filter(item => term.test(item.cliente.nombres)||term.test(item.cliente.apellidos))
      }else if(this.tipo_filtro == 'canal'){
        let term = new RegExp(this.filtro_valor,'i');
        this.matriculas = this.matriculas_const.filter(item => term.test(item.canal))
      }
    } else {
      $.notify('Seleccione el tipo de filtro', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: {
          from: 'top',
          align: 'right',
        },
        delay: 1000,
        animate: {
          enter: 'animated ' + 'bounce',
          exit: 'animated ' + 'bounce',
        },
      });
    }
    $('#modalAdvanced').modal('hide')
  }

  restablecer_const(){
    this.matriculas = this.matriculas_const
    $('#modalAdvanced').modal('hide')
    this.tipo_filtro = ''
    this.filtro_valor = ''
    this.interruptor_form = 'input'
  }

  generar_token(matricula:any,cliente:any){
      this._clienteService.generar_token_encuesta_admin(matricula,cliente,this.token).subscribe(response=>{
        console.log(response);

        this._router.navigate(['/encuesta-satisfaccion',response.token])
      })
  }

  prepar_data(){
    for(var item of this.matriculas){
      let fecha_format = moment(item.createdAt).format("DD-MM-YYYY")
      let color = ''
      if (item.estado == 'Cancelado') {
          color='F9B8BC'
      } else if(item.estado == 'Procesando'){
          color='B8E8F9'
      }
      this.arr_json.push({
        cliente:item.cliente.nombres+' '+ item.cliente.apellidos,
        email:item.cliente.email,
        canal:item.canal,
        asesor:item.asesor.nombres+' '+item.asesor.apellidos,
        monto:item.monto,
        matricula:item.matricula,
        fecha:fecha_format,
        color:color
      })
    }

  }

  toExcel(){

    this.prepar_data()

    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Matriculas");

    worksheet.addRow(undefined);
    for (let x1 of this.arr_json){
      let x2=Object.keys(x1);

      let temp=[]
      for(let y of x2){
        temp.push(x1[y])
      }
      let item = worksheet.addRow(temp);
      item.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
              argb: x1.color
          }
      };
    }

    let fname="Matriculas";

    worksheet.columns = [
      { header: 'Cliente', key: 'col1', width: 30},
      { header: 'Correo', key: 'col2', width: 25},
      { header: 'Canal', key: 'col3', width: 20},
      { header: 'Asesor', key: 'col4', width: 30},
      { header: 'Monto', key: 'col5', width: 15},
      { header: 'Matricula', key: 'col6', width: 15},
      { header: 'Fecha', key: 'col7', width: 20},

    ]as any;


    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, fname+'.xlsx');
    });
  }

  toCsv(){
    this.prepar_data()
    const csv = generateCsv(this.csvConfig)(this.arr_json);
    download(this.csvConfig)(csv)
  }

  init_comentarios(id:any){
    this.load_comentarios = true
    this._matriculaService.obtener_comentarios_matricula_admin(id,this.token).subscribe(response=>{

      this.comentarios = response.data
      this.load_comentarios = false
    })
  }
}
