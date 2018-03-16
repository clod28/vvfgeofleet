# VVFGeoFleet
VVFGeoFleet is a system allowing to track a fleet, where vehicles are equipped with GPS enabled devices periodically sending their position.

The system is composed of two main modules:

* a backend module, based on a RESTful server;
* a frontend module, based on an Angular GUI.

## The backend
The backend is written in C# Asp.Net WebApi, using Visual Studio 2017 Community Edition, with a persistence layer based on MongoDB document database.

The backend:
* collects position messages coming from GPS enabled devices installed on board the vehicles;
* publishes REST actions to efficiently query the collected data.

Queries allow, for instance, to:
* getting the current fleet position (also by vehicle class);
* getting a vehicle position;
* getting a vehicle tracked path, within a given time interval;
* getting vehicles near to a given point (also by vehicle class);
* getting vehicles within a given rectangle;
* getting vehicles inactive since too much time.

The backend is optimized to collect data and hold them forever, without the need for purging old data periodically. The RESTful API leverages the MongoDB database and its spatial features. All database queries are carefully optimized to exploit indexes; thus, the response time is extremely low even in case of millions messages stored.

The RESTful API enables the frontend to graphically display data, but it is especially conceived to be queried by other applications (B2B) in order to act as a decision support system (DSS).

## The frontend
The frontend is based on Angular4 and uses Google maps javascript API to show information.

_To be completed_

# Note
Currently the source code and the RESTful interface is a mix of English and Italian words. During the implementation, the Italian words will be translated as much as possible.


# API Documentation

## POST /api/messaggiPosizione
Stores a new position message. Position message payloads are structured as follows.

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
It returns the stored message location, together with the message itself.

## GET /api/messaggiPosizione/{id}
Returns the message with the specified `id`.

## GET /api/posizioneByCodiceMezzo/{vehicleCode}
Returns current position for the specified vehicle code (translated as `codiceMezzo` in the code).

Note: should vehicle code contain a dot (.) character, you have to add a trailing slash (/) to the action call. Otherwise you would end up having a 404 error.

## GET /api/posizioneFlotta?attSec={seconds}
Returns current position of the entire fleet.

Only the updated positions are returned, i.e. those arrived since the last `attSec` seconds. `attSec` parameter is optional and defaults to the value contained in the `Web.Config` file (`orizzonteTemporale_sec` parameter).

## GET /api/posizioneFlotta/perClassi?classiMezzo={class1}&classiMezzo={class2}&attSec={secondi}
Returns current position of the entire fleet, just for the vehicle classes specified as  input parameters.

Only the updated positions are returned, i.e. those arrived since the last `attSec` seconds. `attSec` parameter is optional and defaults to the value contained in the `Web.Config` file.

## GET /api/prossimita?lat={lat}&lon={lon}&distanzaMaxMt={distMt}&classiMezzo={class1}&classiMezzo={class2}&attSec={secondi}
Returns vehicles close to the specified point, within the maximum radius specified as input parameter (`distanzaMaxMt`).

Optionally, it is possible to specify an array of vehicle classes as a filter.

Only the updated positions are returned, i.e. those arrived since the last `attSec` seconds. `attSec` parameter is optional and defaults to the value contained in the `Web.Config` file. The distance from the specified center is returned, too.

The result is structured as follows.

```json
{
	"istanteQuery": "2018-03-04T20:29:03.686917Z",
	"punto": {
		"type": "Point",
		"lat": -44.630001068115234,
		"lon": 3.4300000667572021
	},
	"distanzaMaxMt": 300000.0,
	"numeroMezzi": 2,
	"durataQuery_msec": 5,
	"risultati": [{
			"messaggioPosizione": {
				"id": "5a9c24f74eb6d93300a3e2a0",
				"codiceMezzo": "M.1101",
				"classiMezzo": ["AV", "diesel", "nero", "metallizzato"],
				"localizzazione": {
					"type": "Point",
					"lat": -44.7388,
					"lon": 3.2939
				},
				"istanteAcquisizione": "2018-03-04T01:23:46.336Z",
				"fonte": {
					"codiceFonte": "J55",
					"classeFonte": "C2"
				},
				"infoFonte": null,
				"infoSO115": {
					"stato": "InViaggio",
					"codiceIntervento": "11KXS",
					"dataIntervento": "2017-10-24T11:33:16.974Z"
				},
				"istanteArchiviazione": "2018-03-04T16:55:19.424Z",
				"ultimo": true
			},
			"distanzaMt": 16208.5889
		}, {
			"messaggioPosizione": {
				"id": "5a9c24ff4eb6d93300a3e822",
				"codiceMezzo": "M.1236",
				"classiMezzo": ["AV", "diesel", "amaranto"],
				"localizzazione": {
					"type": "Point",
					"lat": -47.0248,
					"lon": 1.6938
				},
				"istanteAcquisizione": "2018-03-04T14:12:18.937Z",
				"fonte": {
					"codiceFonte": "A09",
					"classeFonte": "C1"
				},
				"infoFonte": null,
				"infoSO115": {
					"stato": "SulPosto",
					"codiceIntervento": "79WDW",
					"dataIntervento": "2017-07-27T21:44:36.896Z"
				},
				"istanteArchiviazione": "2018-03-04T16:55:27.099Z",
				"ultimo": true
			},
			"distanzaMt": 298653.844
		}
	]
}
```

## GET /api/inRettangolo?lat1={lat1}&lon1={lon1}&lat2={lat2}&lon2={lon2}&classiMezzo={class1}&classiMezzo={class2}&attSec={seconds}
Resturns vehicles within the specified rectangle.

Optionally, it is possible to specify an array of vehicle classes as a filter.

Only the updated positions are returned, i.e. those arrived since the last `attSec` seconds. `attSec` parameter is optional and defaults to the value contained in the `Web.Config` file.

## GET /api/MezziSilenti?daSecondi={seconds}
Returns position messages for vehicles not updating their position since too long time. Useful to detect anomalies on GPS devices.

For instance, if the `daSecondi` is equal to 86400, the action returns the last position message for each vehicle not sending its position since at least one day.

## GET /api/MezziSilenti?daSecondi={seconds}&classiMezzo={class1}&classiMezzo={class2}
Returns position messages for vehicles not updating their position since too long time. Results are filtered by vehicle classes specified as input parameters.

## GET /api/classiMezzo?attSec={seconds}
Returns all vehicle classes with their occurrence for all active vehicles (i.e. those which sent their position within the specified seconds).

This is a faceted search useful to have information about vehicle classes, especially useful to enable fleet filtering by class.

Results are returned in the following form.

```json
[
  {
    "class": "AV",
    "count": 517
  },
  {
    "class": "APS",
    "count": 322
  }
  ...
]
```

## GET /api/percorso/{vehicleCode}?from={isoDate}&to={isoDate}
Returns the path tracked for vehicle having the code specified as parameter, within the specified time interval.

Date are represented in ISO-8601 format (i.e. `2018-03-04T10:45:52.875Z`).


# Dependencies
VVFGeoFleet backend depends on the following libraries.

* **MongoDB.Driver**: C# driver for MongoDB;
* **SimpleInjector**: Dependency Injection (DI) library;
* **log4net**: application log;
* **NUnit v3**: unit tests library;
* **Moq**: mock classes generation library;
* **Bogus**: fake data generation library.

# Licence
Source code is released under the terms of AGPL-3.0 license.

# Disclaimer
Use this project at yuor own risk. The authors are not responsible for any damage which might result from this project usage.
