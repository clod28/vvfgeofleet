﻿//-----------------------------------------------------------------------
// <copyright file="GetMezziInProssimita_DB.cs" company="CNVVF">
// Copyright (C) 2017 - CNVVF
//
// This file is part of VVFGeoFleet.
// VVFGeoFleet is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// SOVVF is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see http://www.gnu.org/licenses/.
// </copyright>
//-----------------------------------------------------------------------
using Modello.Classi;
using Modello.Servizi.Persistence.GeoQuery.Prossimita;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using Persistence.MongoDB.DTOs;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Persistence.MongoDB.Servizi
{
    internal class GetMezziInProssimita_DB : IGetMezziInProssimita
    {
        private readonly IMongoCollection<MessaggioPosizione_DTO> messaggiPosizioneCollection;

        public GetMezziInProssimita_DB(IMongoCollection<MessaggioPosizione_DTO> messaggiPosizioneCollection)
        {
            this.messaggiPosizioneCollection = messaggiPosizioneCollection;
        }

        public QueryProssimitaResult Get(Localizzazione punto, float distanzaMaxMt, string[] classiMezzo)
        {
            BsonDocument query;

            if ((classiMezzo != null) && (classiMezzo.Length > 0))
                query = new BsonDocument {
                { "query", new BsonDocument {
                    { "istanteAcquisizione", new BsonDocument {
                        {
                            "$gt", DateTime.Now.AddHours(-24).ToUniversalTime()
                        }
                    } },
                    { "classiMezzo", new BsonDocument {
                        {
                            "$in", new BsonArray(classiMezzo)
                        }
                    } }
                }
                } };
            else
                query = new BsonDocument {
                { "query", new BsonDocument {
                    { "istanteAcquisizione", new BsonDocument {
                        {
                            "$gt", DateTime.Now.AddHours(-24).ToUniversalTime()
                        }
                    } }
                }
                }
            };

            var geoNearOptions = new BsonDocument {
                { "near", new BsonDocument {
                    { "type", "Point" },
                    { "coordinates", new BsonArray { punto.Lon, punto.Lat } },
                } },
                { "distanceField", "distanza" },
                { "maxDistance", distanzaMaxMt },
                query,
                { "spherical" , true },
            };

            var pipeline = new[] {
                new BsonDocument { { "$geoNear", geoNearOptions } },
            };

            var sw = new Stopwatch();
            sw.Start();
            var prossimitaMezzo = this.messaggiPosizioneCollection.Aggregate<BsonDocument>(pipeline)
                .ToEnumerable()
                .Select(d => new ProssimitaMezzo()
                {
                    MessaggioPosizione = BsonSerializer.Deserialize<MessaggioPosizione_DTO>(d).ConvertToDomain(),
                    DistanzaMt = (float)d["distanza"].AsDouble
                });

            var arrayProssimitaMezzo = prossimitaMezzo.ToArray();
            sw.Stop();

            return new QueryProssimitaResult()
            {
                IstanteQuery = DateTime.Now.ToUniversalTime(),
                NumeroMezzi = arrayProssimitaMezzo.Length,
                DistanzaMaxMt = distanzaMaxMt,
                Punto = punto,
                DurataQuery_msec = sw.ElapsedMilliseconds,
                Risultati = arrayProssimitaMezzo
            };
        }
    }
}
