import { Component, Input, Output, OnInit } from '@angular/core';
import { PosizioneMezzo } from './posizione-mezzo.model';

@Component({
  selector: '[app-posizione-mezzo]',
  templateUrl: './posizione-mezzo.component.html',
  styleUrls: ['./posizione-mezzo.component.css']
})
export class PosizioneMezzoComponent implements OnInit {

  @Input() posizioneMezzo: PosizioneMezzo;
  @Input() istanteUltimoAggiornamento: Date;

  private badgeStatoMezzoCorrente: any ;
  private testoStatoMezzoCorrente: any ;
  private defStatoMezzoCorrente: any ;
  private defStatiMezzo: any ;
  private mapAlert: any ;

  constructor() { }

  ngOnInit() {

    this.defStatiMezzo = [
      ['0',['sconosciuto','badge-light']],
      ['1',['in viaggio','badge-success']],
      ['2',['sul posto','badge-danger']],
      ['3',['in rientro','badge-primary']],
      ['4',['rientrato','badge-info']],
      ['5',['istituto','badge-warning']],
      ['6',['radio','badge-secondary']],
      ['7',['ultima','badge-dark']],      
    ]    ;    
    this.mapAlert = new Map(this.defStatiMezzo);        

    this.defStatoMezzoCorrente = this.mapAlert.get(this.posizioneMezzo.infoSO115.stato);
    this.badgeStatoMezzoCorrente = this.defStatoMezzoCorrente[1];
    this.testoStatoMezzoCorrente = this.defStatoMezzoCorrente[0];
    //console.log(this.badgeStatoMezzoCorrente);
    
  }

}
