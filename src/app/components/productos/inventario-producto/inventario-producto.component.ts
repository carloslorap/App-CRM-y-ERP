import { Component, OnInit } from '@angular/core';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ProductoService } from 'src/app/services/producto.service';
declare var $:any
@Component({
  selector: 'app-inventario-producto',
  templateUrl: './inventario-producto.component.html',
  styleUrls: ['./inventario-producto.component.css']
})
export class InventarioProductoComponent implements OnInit {

  public inventario:any = {
    producto: ''
  };
  public token = localStorage.getItem('token');
  public productos:Array<any> = []
  public variedades: Array<any> = [];
  public inventarios: Array<any> = [];
  public inventarios_const: Array<any> = [];
  public url = GLOBAL.url
  public load_data = true

  public filtro_producto = ''
  public filtro_finicio = ''
  public filtro_ffin = ''

  public ganacia_producto = 0;


  constructor(private _productoService:ProductoService){}

  ngOnInit(): void {
    setTimeout(() => {
      $('.selectpicker').selectpicker();
    }, 50);
    this.init_producto()
    this.init_inventario()
    this.obtener_configuraciones()
  }

init_producto(){
this._productoService.listar_producto_titulo_admin(this.token).subscribe(response=>{
  this.productos = response.data
  setTimeout(() => {
    $('.selectpicker').selectpicker('refresh');
  }, 50);
})
}


select_producto(){
  this._productoService.obtener_variedades_producto_admin(this.inventario.producto,this.token).subscribe(response=>{
    this.variedades = response.data
    setTimeout(() => {
      $('.selectpicker').selectpicker('refresh');
    }, 50);
  })
}


save(){
  if(!this.inventario.producto){
    $.notify('Seleccione el producto', {
      type: 'danger',
      spacing: 10,
      timer: 2000,
      placement: {
          from: 'top',
          align: 'right'
      },
      delay: 1000,
      animate: {
          enter: 'animated ' + 'bounce',
          exit: 'animated ' + 'bounce'
      }
    });
  }else if(!this.inventario.variedad){
    $.notify('Seleccione la variedad', {
      type: 'danger',
      spacing: 10,
      timer: 2000,
      placement: {
          from: 'top',
          align: 'right'
      },
      delay: 1000,
      animate: {
          enter: 'animated ' + 'bounce',
          exit: 'animated ' + 'bounce'
      }
    });
  }else if(!this.inventario.costo_unidad){
    $.notify('Ingrese el costo por unidad', {
      type: 'danger',
      spacing: 10,
      timer: 2000,
      placement: {
          from: 'top',
          align: 'right'
      },
      delay: 1000,
      animate: {
          enter: 'animated ' + 'bounce',
          exit: 'animated ' + 'bounce'
      }
    });
  }else if(this.inventario.costo_unidad <= 0){
    $.notify('Ingrese un costo válido', {
      type: 'danger',
      spacing: 10,
      timer: 2000,
      placement: {
          from: 'top',
          align: 'right'
      },
      delay: 1000,
      animate: {
          enter: 'animated ' + 'bounce',
          exit: 'animated ' + 'bounce'
      }
    });
  }else if(!this.inventario.cantidad){
    $.notify('Ingreses la cantidad', {
      type: 'danger',
      spacing: 10,
      timer: 2000,
      placement: {
          from: 'top',
          align: 'right'
      },
      delay: 1000,
      animate: {
          enter: 'animated ' + 'bounce',
          exit: 'animated ' + 'bounce'
      }
    });
  }else if(this.inventario.cantidad <= 0){
    $.notify('Ingrese una cantidad válida', {
      type: 'danger',
      spacing: 10,
      timer: 2000,
      placement: {
          from: 'top',
          align: 'right'
      },
      delay: 1000,
      animate: {
          enter: 'animated ' + 'bounce',
          exit: 'animated ' + 'bounce'
      }
    });
  }else{
   this.inventario.ganacia_producto = this.ganacia_producto;
    this._productoService.registrar_inventario_admin(this.inventario,this.token).subscribe(
      response=>{
        $.notify('Se registro el nuevo ingreso', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: {
              from: 'top',
              align: 'right'
          },
          delay: 1000,
          animate: {
              enter: 'animated ' + 'bounce',
              exit: 'animated ' + 'bounce'
          }
        });
        $('#exampleModalCenter').modal('hide');
         this.init_inventario();
      }
    );

  }

}


init_inventario(){
  this.load_data = true
  this._productoService.listar_inventario_admin(this.token).subscribe(response=>{
    console.log(response);

  this.inventarios = response.data
  this.inventarios_const = this.inventarios

  this.load_data = false
})
}


filtrar_data(){
  if(!this.filtro_finicio){
    $.notify('Ingrese la fecha de inicio', {
      type: 'danger',
      spacing: 10,
      timer: 2000,
      placement: {
          from: 'top',
          align: 'right'
      },
      delay: 1000,
      animate: {
          enter: 'animated ' + 'bounce',
          exit: 'animated ' + 'bounce'
      }
    });
  }else if(!this.filtro_ffin){
    $.notify('Ingrese la fecha de fin', {
      type: 'danger',
      spacing: 10,
      timer: 2000,
      placement: {
          from: 'top',
          align: 'right'
      },
      delay: 1000,
      animate: {
          enter: 'animated ' + 'bounce',
          exit: 'animated ' + 'bounce'
      }
    });
  }else{
    //FILTRO
    let tt_inicio = Date.parse(this.filtro_finicio+'T00:00:00')/1000;
    let tt_fin = Date.parse(this.filtro_ffin+'T23:59:59')/1000;
    let term = new RegExp(this.filtro_producto,'i');

    this.inventarios = [];
    for(var item of this.inventarios_const){
      let tt_fecha = Date.parse(item.createdAt)/1000;

      if(tt_fecha >= tt_inicio && tt_fecha <= tt_fin){
         if(term.test(item.producto.titulo)){
          this.inventarios.push(item);
         }
      }
    }
  }
}


obtener_configuraciones(){
  this._productoService.obtener_configuraciones().subscribe(
    response=>{

      this.ganacia_producto = response.ganacia_producto;
      console.log(this.ganacia_producto);
    }
  );
}


}
