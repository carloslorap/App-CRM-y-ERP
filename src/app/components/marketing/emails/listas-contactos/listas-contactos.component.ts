import { Component, OnInit } from '@angular/core';
import { EmailService } from 'src/app/services/email.service';
declare var $: any;

@Component({
  selector: 'app-listas-contactos',
  templateUrl: './listas-contactos.component.html',
  styleUrls: ['./listas-contactos.component.css']
})
export class ListasContactosComponent implements OnInit {

  public token: any = localStorage.getItem('token');
  public listas :Array<any> = [];
  public name_list = ''
  public str_import = ''
  public str_idList = ''
  public load_data = true;
  public btn_load = false
  public btn_load_import = false


  public contactos :Array<any> = [];
  public load_contactos = true;

  constructor(private _emailService:EmailService){}

  ngOnInit(): void {
    this.init_data()
  }

  init_data(){
    this.load_data = true
    this._emailService.obtener_listas_contactos(this.token).subscribe(response=>{
      console.log(response);
      this.listas = response.data.lists
      this.load_data = false
    })
  }

  crear_lista(){
    this.btn_load = true
    this._emailService.registrar_lista_contacto({titulo:this.name_list},this.token).subscribe(response=>{
      $('#createList').modal('hide')
      this.init_data()
      this.btn_load = false
    })
  }

  openImport(id:any){
    this.str_idList = id
  }

  obtenerContactos(id:any){
    this.load_contactos = true
    this._emailService.obtener_contactos_lista(id,this.token).subscribe(response=>{
      this.contactos= response.data.contacts
      this.load_contactos = false
    })
  }

  importar_contactos(){
    let data={
      str_import:this.str_import,
      idList:this.str_idList,
    }
    this.btn_load_import = true
    this._emailService.importar_contacto(data,this.token).subscribe(response=>{
      $('#contactsImport').modal('hide')
      this.init_data()
      this.btn_load_import = false
      console.log(response);

    })
  }



}
