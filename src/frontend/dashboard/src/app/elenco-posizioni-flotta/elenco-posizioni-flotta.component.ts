import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PosizioneMezzo } from '../posizione-mezzo/posizione-mezzo.model';
import * as moment from 'moment';
import { VoceFiltro } from "../filtri/voce-filtro.model";

//import { UiSwitchModule } from 'angular2-ui-switch';
import { UiSwitchModule } from 'ngx-ui-switch';

@Component({
  selector: 'app-elenco-posizioni-flotta',
  templateUrl: './elenco-posizioni-flotta.component.html',
  styleUrls: ['./elenco-posizioni-flotta.component.css']
})
export class ElencoPosizioniFlottaComponent implements OnInit {

  @Input() elencoUltimePosizioni : PosizioneMezzo[] = [];
  @Input() istanteUltimoAggiornamento: Date;
  @Input() maxIstanteAcquisizione: Date ;
  
  private maxIstanteAcquisizionePrecedente: Date = new Date("01/01/1900 00:00:00");

  public elencoPosizioni : PosizioneMezzo[] = [];
 // public elencoPosizioniDaElaborare: PosizioneMezzo[] = [];
  public mezzoSelezionato: PosizioneMezzo;

  startLat: number = 41.889777;
  startLon: number = 12.490689;
  startZoom: number = 6;


  centerOnLast: boolean = true;

  /*
  vociFiltroStatiMezzo: VoceFiltro[] = [
      new VoceFiltro(
        "1", "In viaggio verso l'intervento ", 0, true, "", "badge-success"
      ),
      new VoceFiltro(
        "2", "Arrivato sull'intervento", 0, true, "", "badge-danger"
      ),
      new VoceFiltro(
        "3", "In rientro dall'intervento", 0, true, "", "badge-primary"
      ),
      new VoceFiltro(
        "4", "Mezzi rientrati in Sede", 0, false, "", "badge-secondary"
      ),
      new VoceFiltro(
        "5", "Fuori per motivi di Istituto", 0, true, "", "badge-istituto"
      ),
      // posizione inviata da una radio non associata a nessun Mezzo
      new VoceFiltro(
        "6", "Posizioni Radio senza Mezzo", 0, false, "", "badge-radio"
      ),
      // posizione inviata da un Mezzo fuori servizio  
      new VoceFiltro(
        "7", "Mezzi fuori servizio", 0, false, "","badge-fuori-servizio"
      ),
      new VoceFiltro(
        "0", "Stato operativo Sconosciuto", 0, false, "", "badge-light"
      )
    ];
    */

   vociFiltroStatiMezzo: VoceFiltro[] = [
    new VoceFiltro(
      "1", "In viaggio verso l'intervento ", 0, true, "", "badge-info", 
      "assets/images/mm_20_red.png"
    ),
    new VoceFiltro(
      "2", "Arrivato sull'intervento", 0, true, "", "badge-info", 
      "assets/images/mm_20_blue.png"
    ),
    new VoceFiltro(
      "3", "In rientro dall'intervento", 0, true, "", "badge-info", 
      "assets/images/mm_20_green.png"
    ),
    new VoceFiltro(
      "4", "Mezzi rientrati dall'intervento", 0, false, "", "badge-info", "assets/images/mm_20_gray.png"
    ),
    new VoceFiltro(
      "5", "Fuori per motivi di Istituto", 0, false, "", "badge-info", "assets/images/mm_20_yellow.png"
    ),
    // posizione inviata da una radio non associata a nessun Mezzo
    new VoceFiltro(
      "6", "Posizioni Radio senza Mezzo", 0, false, "", "badge-info", "assets/images/mm_20_orange.png"
    ),
    // posizione inviata da un Mezzo fuori servizio  
    new VoceFiltro(
      "7", "Mezzi fuori servizio", 0, false, "","badge-info", "assets/images/mm_20_cyan.png"
    ),
    new VoceFiltro(
      "0", "Stato operativo Sconosciuto", 0, false, "", "badge-info", "assets/images/mm_20_black.png"
    )
    ];

    vociFiltroStatiMezzoDefault: VoceFiltro[];
  
    titoloFiltroStatiMezzo: string = "Stati Mezzo";
    filtriStatiMezzo: string[] = [];
    
  constructor() { }

  ngOnInit() {

    this.inizializzaFiltri();  
  }

  ngOnChanges(changes: any) {
  
    this.inizializzaFiltri();  
  }

  inizializzaFiltri() {

    if (this.elencoPosizioni.length == 0 ) 
      { this.elencoPosizioni = this.elencoUltimePosizioni; }
    else
      {

        // individua le posizioni non ancora elaborate
        var elencoPosizioniNuove: PosizioneMezzo[] = this.elencoUltimePosizioni.
          filter( (item) => {
            var v = this.elencoPosizioni.find( x => item.codiceMezzo == x.codiceMezzo );
            if ( v == null) {
              return item}
            else {return null}  }
          );
          
        // aggiunge le posizioni non ancora elaborate
        this.elencoPosizioni = this.elencoPosizioni.concat(elencoPosizioniNuove);

        // rimuove dalle posizioni da elaborare quelle Nuove
        elencoPosizioniNuove.forEach( v => { 
            var k = this.elencoUltimePosizioni.indexOf( v );
            if (k != -1) { this.elencoUltimePosizioni.splice(k,1); 
                  }
          });

        // modifica nelle posizioni Mostrate quelle con variazioni
        this.elencoUltimePosizioni.forEach( item => { 
          var v = this.elencoPosizioni.findIndex( x => item.codiceMezzo === x.codiceMezzo );
          if ( v != null) {  
            if (item.infoSO115.stato != "0")
              { this.elencoPosizioni[v] = item; }
            else
              { this.elencoPosizioni[v].fonte = item.fonte;
                this.elencoPosizioni[v].classiMezzo = item.classiMezzo;
                this.elencoPosizioni[v].istanteAcquisizione = item.istanteAcquisizione;
                this.elencoPosizioni[v].istanteArchiviazione = item.istanteArchiviazione;
                this.elencoPosizioni[v].istanteInvio = item.istanteInvio;
                this.elencoPosizioni[v].localizzazione = item.localizzazione;
              }
          }    
        } )

        // riordina l'array
        this.elencoPosizioni = this.elencoPosizioni.sort( 
          function(a,b) 
          { var bb : Date = new Date(b.istanteAcquisizione);
            var aa : Date  = new Date(a.istanteAcquisizione);
            return aa>bb ? -1 : aa<bb ? 1 : 0;
          });
      }
    /*
    var statiMezzo : string[] = [ "0", "1", "2", "3", "4", "5", "6"];

    this.vociFiltroStatiMezzo = Object.keys(statiMezzo).map(desc => new VoceFiltro(desc, desc, statiMezzo[desc]));
    */

    // filtra solo le posizioni su cui sono disponibili le info di SO115
    this.elencoUltimePosizioni = this.elencoUltimePosizioni.filter(r => r.infoSO115 != null);

    // elabora solo le posizioni su cui sono disponibili le info di SO115
    this.elencoPosizioni = this.elencoPosizioni.filter(r => r.infoSO115 != null);
    // elabora solo le posizioni su cui sono NON disponibili le info di SO115
    //this.elencoPosizioni = this.elencoPosizioni.filter(r => r.infoSO115 === null);
    
    this.vociFiltroStatiMezzo.find(v => v.codice === "0").cardinalita = this.elencoPosizioni.filter(r =>  r.infoSO115.stato.localeCompare("0") === 0).length;
    this.vociFiltroStatiMezzo.find(v => v.codice === "1").cardinalita = this.elencoPosizioni.filter(r =>  r.infoSO115.stato.localeCompare("1") === 0).length;
    this.vociFiltroStatiMezzo.find(v => v.codice === "2").cardinalita = this.elencoPosizioni.filter(r =>  r.infoSO115.stato.localeCompare("2") === 0).length;
    this.vociFiltroStatiMezzo.find(v => v.codice === "3").cardinalita = this.elencoPosizioni.filter(r =>  r.infoSO115.stato.localeCompare("3") === 0).length;
    this.vociFiltroStatiMezzo.find(v => v.codice === "4").cardinalita = this.elencoPosizioni.filter(r =>  r.infoSO115.stato.localeCompare("4") === 0).length;
    this.vociFiltroStatiMezzo.find(v => v.codice === "5").cardinalita = this.elencoPosizioni.filter(r =>  r.infoSO115.stato.localeCompare("5") === 0).length;
    this.vociFiltroStatiMezzo.find(v => v.codice === "6").cardinalita = this.elencoPosizioni.filter(r =>  r.infoSO115.stato.localeCompare("6") === 0).length;
    this.vociFiltroStatiMezzo.find(v => v.codice === "7").cardinalita = this.elencoPosizioni.filter(r =>  r.infoSO115.stato.localeCompare("7") === 0).length;

    /*
    // assegnna alle posizioni da elaborare quelle archiviate successivamente 
    //all'istante di elborazione precedente
    this.elencoPosizioniDaElaborare = this.elencoPosizioni.
      filter(r => (new Date(r.istanteAcquisizione) > this.maxIstanteAcquisizionePrecedente ) );
      //filter(r => (new Date(r.istanteAcquisizione) > this.maxIstanteAcquisizionePrecedente ) );
    */
    this.maxIstanteAcquisizionePrecedente = this.maxIstanteAcquisizione;

    /*
    l'ipotesi di creare un altro vettore aggiungendo la proprietà "visible" 
    per tutti gli elementi, e di impostarla in base allo stato dei filtri selezionato 
    (true/false) si è rivelata una soluzione molto lenta e quindi abbandonata

    //this.elencoPosizioniMezzoFiltrate = this.elencoPosizioni;


        import { PosizioneMezzo } from '../posizione-mezzo/posizione-mezzo.model';

        export class PosizioneMezzoFiltrata {
            constructor (
                public posizioneMezzo:PosizioneMezzo,       
                public visible:boolean
            ) {}
            
            }


    this.elencoPosizioniMezzoFiltrate = this.elencoPosizioni.map( 
      (posizioneMezzo) => 
        { return Object.assign({}, {posizioneMezzo, "visible": true }) });
    */
    
    if (this.vociFiltroStatiMezzo.length > 0) {
    /*
      l'ipotesi di creare un altro vettore con i soli elementi filtrari 
      è anch'essa troppo lenta su un elevato numero di elementi


      this.vociFiltroStatiMezzoDefault = this.vociFiltroStatiMezzo.
      filter( v => v.selezionato === true);

      this.elencoPosizioniMezzoFiltrate = this.elencoPosizioniMezzoFiltrate.
        filter(r => this.vociFiltroStatiMezzoDefault.
        some(filtro => filtro.codice.toString() === r.infoSO115.stato));
      
    */
    /*
      l'ipotesi di applicare un filtro sullo stesso vettore utilizzando 
      il metodo forEach() è anch'essa troppo lenta su un elevato numero di elementi

      this.elencoPosizioniMezzoFiltrate.forEach( pos => 
        pos.selezionata = this.vociFiltroStatiMezzoDefault.
        some(filtro => filtro.codice.toString() === pos.infoSO115.stato));
      //console.log(this.elencoPosizioniMezzoFiltrate);
      
     */

     // soluzione utilizzando una funzione valutata durante l'aggiornamento della view
      this.filtriStatiMezzo = this.vociFiltroStatiMezzo
      .filter(v => v.selezionato)
      .map(v => (v.codice).toString())
      ;

      if (this.mezzoSelezionato == null || this.centerOnLast) {
        this.mezzoSelezionato = this.elencoPosizioni[0];
      }

    }
        


  }

  
  nuovaSelezioneStatiMezzo(event) {

    //console.log('event: ' + event);
    this.filtriStatiMezzo = event;


  }
  

  centraSuMappa(evento) {
    var tipoevento: string = evento[1];
    if (tipoevento == "click") {
      this.mezzoSelezionato = evento[0];
      this.startLat = Number(this.mezzoSelezionato.localizzazione.lat);
      this.startLon = Number(this.mezzoSelezionato.localizzazione.lon);
      this.startZoom = 12;
    }
    //console.log("centraSuMappa", this.mezzoSelezionato);
  }

  evidenziaSuMappa(evento) {
    var tipoevento: string = evento[1];
    if (tipoevento == "mouseover") {
      this.mezzoSelezionato = evento[0];
    }
    //console.log("centraSuMappa", this.mezzoSelezionato);
  }

}
