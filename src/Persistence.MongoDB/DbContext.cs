﻿using Modello;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Persistence.MongoDB
{
    public class DbContext
    {
        private static IMongoDatabase database;

        public DbContext()
        {
            if (database == null)
            {
                var client = new MongoClient();
                database = client.GetDatabase("VVFGeoFleet");
            }
        }

        public IMongoCollection<MessaggioPosizione> MessaggiPosizione
        {
            get
            {
                return database.GetCollection<MessaggioPosizione>("messaggiPosizione");
            }
        }
    }
}