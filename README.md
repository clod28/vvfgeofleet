# VVFGeoFleet
Sistema per la localizzazione della flotta mezzi VVF

# Documentazione API

## POST /api/messaggiPosizione
Inserisce un nuovo messaggio di geo-localizzazione in archivio.

Esempio di payload.

```json
{
    "codiceMezzo": "APS.12345",
    "classiMezzo": [ "APS", "benzina" ],
    "localizzazione": {
        "lat": 14.2345,
        "lon": 43.4321
    },
    "istanteAcquisizione": "2017-11-27T10:12:00.1234Z",
    "fonte": {
        "codiceFonte": "AH222",
        "classeFonte": "gpsTracker"
    },
    "infoFonte": {
      
    }
}
```
Restituisce la location del messaggio inserito, ed il messaggio stesso.

## GET /api/messaggiPosizione/{id}
Restituisce il messaggio avente `id` specificato.

## GET /api/posizioneByCodiceMezzo/{codiceMezzo}
Restituisce la posizione per il mezzo avente `codiceMezzo` specificato.

## GET /api/posizioneFlotta
Restituisce la posizione dell'intera flotta.

## GET /api/posizioneFlotta/perClassi?classiMezzo=classe1&classiMezzo=classe2&classiMezzo=classe3
Restituisce la posizione dell'intera flotta, limitatamente ai mezzi delle classi specificate come parametro d'ingresso.

# Descrizione dell'architettura
L'applicazione è sviluppata in linguaggio C# con Visual Studio 2017. L'architettura è una WebApi, basata su servizi REST, con uno strato di persistenza basato su MongoDB.

# Librerie utilizzate

- *MongoDB.Driver*: il driver C# per l'integrazione con MongoDB;
- *SimpleInjector*: la libreria per la Dependency Injection (DI);
- *AutoMapper*: la libreria per il mapping convention based tra le classi di dominio e i DTO;
- *log4net*: libreria per il logging applicativo.
