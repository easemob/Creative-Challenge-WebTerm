using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MQTTAppWeb
{
    public class Message
    {
        public string SendClientId { get; set; }

        public string action { get; set; }

        public string msg { get; set; }

        public string nick { get; set; }
        public Command cmd { get; set; }
    }

    public class Command
    {
        public string Op { get; set; }
        public string Data { get; set; }
        public string Cols { get; set; }
        public string Rows { get; set; }

    }
}
