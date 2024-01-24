import { Component, OnInit } from '@angular/core';
import { ProductoService } from 'src/app/services/producto.service';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { mkConfig, generateCsv, download } from "export-to-csv";
declare var $: any;

@Component({
  selector: 'app-inventario-general',
  templateUrl: './inventario-general.component.html',
  styleUrls: ['./inventario-general.component.css'],
})
export class InventarioGeneralComponent implements OnInit {
  public token: any = localStorage.getItem('token');

  public categorias: Array<any> = [];

  public filtro_texto = '';
  public filtro_tipo = 'Todos';
  public filtro_categoria = 'Todos';
  public load_data = true;

  public arr_json :Array<any>=[]
  public csvConfig = mkConfig({ useKeysAsHeaders: true });

  public inventario: Array<any> = [];
  public inventario_const: Array<any> = [];

  constructor(private _productoService: ProductoService) {}

  ngOnInit(): void {
    this.init_data();
    this.init_categorias();
  }

  init_data() {
    this.load_data = true;
    this._productoService
      .obtener_inventario_admin(this.token)
      .subscribe((response) => {
        this.inventario = [];
        for (let item of response.data) {
          this.inventario.push({
            sku: item.sku.toUpperCase(),
            producto: item.producto.titulo.toUpperCase(),
            tipo: item.producto.tipo,
            variedad: item.titulo.toUpperCase(),
            categoria: item.producto.categoria.toUpperCase(),
            stock: item.stock,
            precio: item.producto.precio,
          });
        }
        this.inventario_const = this.inventario;
        this.load_data = false;
      });
  }

  init_categorias() {
    this._productoService.obtener_configuraciones().subscribe((response) => {
      this.categorias = response.categorias;
    });
  }

  search() {
    let term_texto = new RegExp(this.filtro_texto, 'i');
    let term_tipo: any;
    let term_categoria: any;
    if (this.filtro_tipo != 'Todos') {
      term_tipo = new RegExp(this.filtro_tipo, 'i');
    }
    if (this.filtro_categoria != 'Todos') {
      term_categoria = new RegExp(this.filtro_categoria, 'i');
    }
    console.log(this.filtro_tipo);

    this.inventario = [];
    for (var item of this.inventario_const) {
      if (this.filtro_tipo == 'Todos') {
        if (this.filtro_categoria == 'Todos') {
          if (term_texto.test(item.sku) || term_texto.test(item.producto)) {
            this.inventario.push(item);
          }
        } else {
          if (term_categoria.test(item.categoria)) {
            if (term_texto.test(item.sku) || term_texto.test(item.producto)) {
              this.inventario.push(item);
            }
          }
        }
      } else {
        if (term_tipo.test(item.tipo)) {
          if (this.filtro_categoria == 'Todos') {
            if (term_texto.test(item.sku) || term_texto.test(item.producto)) {
              this.inventario.push(item);
            }
          } else {
            if (term_categoria.test(item.categoria)) {
              if (term_texto.test(item.sku) || term_texto.test(item.producto)) {
                this.inventario.push(item);
              }
            }
          }
        }
      }
    }
  }



  downloadExcel() {
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Inventario');

    //CONVIRTIENDO NUESTRO ARREGLO A UN FORMATO LEGIBLE PARA EXCEL USANDO EXCELJS
    worksheet.addRow(undefined);
    for (let x1 of this.inventario) {
      let x2 = Object.keys(x1);

      let temp = [];
      for (let y of x2) {
        temp.push(x1[y]);
      }
      worksheet.addRow(temp);
    }
    //NOMBRE DEL ARCHIVO RESULTANTE
    let fname = 'INVENTARIO';

    //ASIGNACIÓN DE LA CABECERA DEL DOCUMENTO EXCEL DONDE CADA CAMPO DE LOS DATOS QUE EXPORTAREMOS SERA UNA COLUMNA
    worksheet.columns = [
      { header: 'SKU', key: 'col1', width: 20 },
      { header: 'PRODUCTO', key: 'col2', width: 35 },
      { header: 'TIPO', key: 'col5', width: 15 },
      { header: 'VARIEDAD', key: 'col3', width: 20 },
      { header: 'CATEGORIA', key: 'col4', width: 25 },
      { header: 'STOCK', key: 'col5', width: 15 },
      { header: 'PRECIO', key: 'col6', width: 15 },
    ] as any;

    //PREPACION DEL ARCHIVO Y SU DESCARGA
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      fs.saveAs(blob, fname + '.xlsx');
    });
  }


  toCsv(){

    const csv = generateCsv(this.csvConfig)(this.inventario);
    download(this.csvConfig)(csv)
  }
}
