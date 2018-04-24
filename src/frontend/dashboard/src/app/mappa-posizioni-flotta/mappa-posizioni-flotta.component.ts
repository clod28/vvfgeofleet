import { ErrorHandler, Component, ElementRef, OnInit, Input } from '@angular/core';
import { PosizioneMezzo } from '../posizione-mezzo/posizione-mezzo.model';
import { GoogleMapsAPIWrapper, MarkerManager } from '@agm/core';
import { AgmMarker, MouseEvent } from '@agm/core';

import { Directive, Output, EventEmitter, AfterViewInit, ContentChildren, QueryList } from '@angular/core';

import * as moment from 'moment';

@Component({
  selector: 'app-mappa-posizioni-flotta',
  templateUrl: './mappa-posizioni-flotta.component.html',
  styleUrls: ['./mappa-posizioni-flotta.component.css'],
  providers: [{ provide: MarkerManager, useClass:MarkerManager}, 
    { provide: GoogleMapsAPIWrapper, useClass:GoogleMapsAPIWrapper}    ,
    { provide: AgmMarker, useClass:AgmMarker}    
    
  ]
})


export class MappaPosizioniFlottaComponent implements OnInit {
  
  @Input() elencoPosizioni : PosizioneMezzo[] = [];
  @Input() elencoPosizioniDaElaborare : PosizioneMezzo[] = [];
  @Input() istanteUltimoAggiornamento: Date;
  @Input() filtriStatiMezzo: string[] = [];

  @Input() mapLat: number ;
  @Input() mapLon: number ;
  @Input() mapZoom: number ;

  @Input() mezzoSelezionato: PosizioneMezzo ;

  //lat: number = 51.678418;
  //lon: number = 7.809007;
  
  start_lat: number = 41.889777;
  start_lon: number = 12.490689;
  start_zoom: number = 6;
  

  clicked_label: string;

  private iconaStatoMezzoCorrente: any ;
  private iconeStati: any ;
  private mapIcone: any ;
  private iconeStatiSelezionato: any ;
  private mapIconeSelezionato: any ;
  
  private markerManager: MarkerManager ;
  private markerArrays: AgmMarker[];

  //private markers: AgmMarker;

  public elencoPosizioniMostrate : PosizioneMezzo[] = [];
  private elencoPosizioniMostratePrecedenti : PosizioneMezzo[] = [];

  private elencoPosizioniNuove : PosizioneMezzo[] = [];
  private elencoPosizioniEliminate : PosizioneMezzo[] = [];
  private elencoPosizioniRientrate : PosizioneMezzo[] = [];
  private elencoPosizioniModificate : PosizioneMezzo[] = [];
  private sedeMezzoCorrente : string;

  constructor() {}    

  ngOnInit() {


       this.iconeStati = [
      ['0','assets/images/mm_20_black.png'],
      ['1','assets/images/mm_20_red.png'],
      ['2','assets/images/mm_20_blue.png'],
      ['3','assets/images/mm_20_green.png'],
      ['4','assets/images/mm_20_gray.png'],
      ['5','assets/images/mm_20_yellow.png'],
      ['6','assets/images/mm_20_orange.png'],
      ['7','assets/images/mm_20_cyan.png']
    ]    ;    
    this.mapIcone = new Map(this.iconeStati);    

    this.iconeStatiSelezionato = [
      ['0','assets/images/mm_30_black.png'],
      ['1','assets/images/mm_30_red.png'],
      ['2','assets/images/mm_30_blue.png'],
      ['3','assets/images/mm_30_green.png'],
      ['4','assets/images/mm_30_gray.png'],
      ['5','assets/images/mm_30_yellow.png'],
      ['6','assets/images/mm_30_orange.png'],
      ['7','assets/images/mm_30_cyan.png']
    ]    ;    
    this.mapIconeSelezionato = new Map(this.iconeStatiSelezionato);    
    
    if ( this.mapLat == null ) { this.mapLat = this.start_lat; }
    if ( this.mapLon == null ) { this.mapLon = this.start_lon; }
    if ( this.mapZoom == null ) { this.mapZoom = this.start_zoom; }

  }


  ngOnChanges() {

    //console.log("ngOnChanges()-mezzo Selezionato", this.mezzoSelezionato);
    // individua le posizioni non ancora elaborate
    this.elencoPosizioniNuove = this.elencoPosizioniDaElaborare.
      filter( (item) => {
        var v = this.elencoPosizioniMostratePrecedenti.find( x => item.codiceMezzo == x.codiceMezzo );
        if ( v == null) {
          return item}
        else {return null}  }
       );
    
    // aggiunge alle posizioni Mostrate quelle Nuove     
    this.elencoPosizioniMostrate = this.elencoPosizioniMostrate.concat(this.elencoPosizioniNuove);

    // rimuove dalle posizioni da elaborare quelle Nuove
    this.elencoPosizioniNuove.forEach( v => { 
      var k = this.elencoPosizioniDaElaborare.indexOf( v );
      if (k != -1) { this.elencoPosizioniDaElaborare.splice(k,1); 
     }
    })


    /*
    console.log('ngOnChanges - elencoPosizioniPrecedenti: ', this.elencoPosizioniPrecedenti );
    console.log('ngOnChanges - elencoPosizioni: ', this.elencoPosizioni );
    console.log('ngOnChanges - elencoPosizioniNuove: ', this.elencoPosizioniNuove );
    */

    //this.gmapsApi.getNativeMap().then(map => {
    //  this.markerManager.getNativeMarker(this.agmMarker).then(marker => { console.log(marker);
    //  });
    //});  
    
    /*
    // individua le posizioni eliminate estraendo quello non più presenti 
    // nell'elenco aggiornato rispetto a quello precedente
    this.elencoPosizioniEliminate = this.elencoPosizioniMostratePrecedenti.
    filter( (item) => {
      var v = this.elencoPosizioniDaElaborare.find( x => item.codiceMezzo == x.codiceMezzo );
      if ( v == null) {return item}
      else {return null}  }
    );
    */
     /*
    // estra le posizioni dei Mezzi rientrati
    this.elencoPosizioniRientrate = this.elencoPosizioniMostratePrecedenti.
     filter( (item) => {
       var v = this.elencoPosizioniDaElaborare.find( x => item.infoSO115.stato == '4' );
       if ( v != null) {return item}
       else {return null}  }
    );
       
    // aggiunge alle posizioni da eliminare quelle dei Mezzi rientrati
    this.elencoPosizioniEliminate = this.elencoPosizioniEliminate.concat(this.elencoPosizioniRientrate);
    */
    /*
    // rimuove dalle posizioni Mostrate quelle Eliminate
    this.elencoPosizioniEliminate.forEach( v => { 
       var k = this.elencoPosizioniMostrate.indexOf( v );
       if (k != -1) { this.elencoPosizioniMostrate.splice(k,1); 
      }
     })
     */


    // modifica nelle posizioni Mostrate quelle con variazioni
    this.elencoPosizioniDaElaborare.forEach( item => { 
      var v = this.elencoPosizioniMostrate.findIndex( x => item.codiceMezzo === x.codiceMezzo );
      if ( v != null) {  this.elencoPosizioniMostrate[v] = item; }    
    } )

    // salva l'elenco delle posizioni Mostrate attualmente
    this.elencoPosizioniMostratePrecedenti = this.elencoPosizioniMostrate;
    
  }
    
  markerIconUrl(m: PosizioneMezzo) {
    //console.log("mezzo Selezionato", this.mezzoSelezionato, "mezzo corrente", m);

    /*
    if (m == this.mezzoSelezionato) {
      this.iconaStatoMezzoCorrente = 'assets/images/car.png'; }
    else
    {
    */ 
    if (m.infoSO115 != null) {
      if (m.codiceMezzo == this.mezzoSelezionato.codiceMezzo) {
          this.iconaStatoMezzoCorrente = this.mapIconeSelezionato.get(m.infoSO115.stato);
        }
      else
        {
          this.iconaStatoMezzoCorrente = this.mapIcone.get(m.infoSO115.stato);  
        }
      }
    else {
      if (m.codiceMezzo == this.mezzoSelezionato.codiceMezzo) {
      this.iconaStatoMezzoCorrente = this.mapIconeSelezionato.get('0');
        }
      else
        {
          this.iconaStatoMezzoCorrente = this.mapIcone.get('0');          
        }
      }
    return this.iconaStatoMezzoCorrente;
  }

  clickedMarker(mezzo: PosizioneMezzo, index: number) {
    //this.clicked_label = this.elencoPosizioniMostrate[index].codiceMezzo;
    //this.clicked_label = mezzo.codiceMezzo;
    this.mezzoSelezionato.codiceMezzo = mezzo.codiceMezzo;
    this.mapLat = Number(mezzo.localizzazione.lat);
    this.mapLon = Number(mezzo.localizzazione.lon);
    this.mapZoom = 12;    

    //console.log('clicked the marker: ', mezzo, index);
  }

  overMarker(mezzo: PosizioneMezzo, index: number) {
    //console.log('over the marker: ', mezzo, index);
    this.mezzoSelezionato = mezzo;
    this.sedeMezzo(mezzo);
  }

  outOfMarker(mezzo: PosizioneMezzo, index: number) {
    //console.log('out of the marker: ', mezzo, index);
  }

  setMarkerManager(markerManager: MarkerManager){
    this.markerManager = markerManager;
    //console.log("setMarkerManager: ", markerManager);
   }

  /**
   * Imposta l'array dei markers presenti sulla mappa
   */
  setMarkers(markers: AgmMarker[]){
    //console.log("AgmMarkers: ", markers);
    this.markerArrays = markers;
    /*
    console.log("NativeMarkers: ");
    for(let marker of markers){
      this.markerManager.getNativeMarker(marker).then(marker => {
        console.log(marker);
      });
    }
    */


  }

  posizioneMezzoSelezionata(p : PosizioneMezzo) { 
      var r : boolean = this.filtriStatiMezzo.
      some(filtro => filtro === p.infoSO115.stato );    
      return r;
  }

  sedeMezzo(p : PosizioneMezzo) {
    return (p.classiMezzo.
      find( i =>  i.substr(0,5) == "PROV:")).substr(5,2);    
  }


  classiMezzoDepurata(p : PosizioneMezzo) {
    return p.classiMezzo.
      filter( i =>  (i.substr(0,5) != "PROV:") )
  }

  indiceMezzoSelezionato(m: PosizioneMezzo) {
    //console.log("mezzo Selezionato", this.mezzoSelezionato, "mezzo corrente", m);

    /*
    if (m == this.mezzoSelezionato) {
      this.iconaStatoMezzoCorrente = 'assets/images/car.png'; }
    else
    {
    */ 
   if (m.codiceMezzo == this.mezzoSelezionato.codiceMezzo) 
      { return 2; } else {return 1; }
  }
}
