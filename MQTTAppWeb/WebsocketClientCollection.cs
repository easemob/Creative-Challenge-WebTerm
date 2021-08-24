using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MQTTAppWeb
{
    public class WebsocketClientCollection
    {
        private static List<WebsocketClient> _clients = new List<WebsocketClient>();

        public static void Add(WebsocketClient client)
        {
            _clients.Add(client);
        }

        public static void Remove(WebsocketClient client)
        {
            _clients.Remove(client);
        }

        public static WebsocketClient Get(string clientId)
        {
            var client = _clients.FirstOrDefault(c=>c.Id == clientId);

            return client;
        }
        public static List<WebsocketClient> GetAll()
        {
            var client = _clients;
            return client;
        }

        public static List<WebsocketClient> GetRoomClients(string roomNo)
        {
            var client = _clients.Where(c => c.RoomNo == roomNo);
            return client.ToList();
        }
        public static string Message(string roomNo)
        {
            return "sdsdsdsdd";
        }

        public static string Data(string roomNo)
        {
            return "sdsdsdsddData";
        }
        public static bool Contain(WebsocketClient client)
        {
           return _clients.Contains(client);
        }

    }
}
