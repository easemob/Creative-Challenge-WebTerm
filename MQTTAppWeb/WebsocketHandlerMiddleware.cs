using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using MQTTnet.App.Pages.Connection;
using MQTTnet.App.Pages.Publish;
using MQTTnet.App.Pages.Subscriptions;
using MQTTnet.App.Services.Client;
using MQTTnet.Client.Subscribing;

namespace MQTTAppWeb
{
    public class WebsocketHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger _logger;
        readonly MqttClientService _mqttClientService;
        private readonly IConfiguration _configuration;
        public WebsocketHandlerMiddleware(
            RequestDelegate next,
            ILoggerFactory loggerFactory, IConfiguration configuration, MqttClientService mqttClientService)
        {
            _next = next;
            _configuration = configuration;
            _mqttClientService = mqttClientService;
            _logger = loggerFactory.
                CreateLogger<WebsocketHandlerMiddleware>();
        }

        public async Task Invoke(HttpContext context)
        {
            if (context.Request.Path == "/ws")
            {
                if (context.WebSockets.IsWebSocketRequest)
                {
                    WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
                    string clientId = Guid.NewGuid().ToString(); ;
                    var wsClient = new WebsocketClient
                    {
                        Id = clientId,
                        WebSocket = webSocket
                    };
                    try
                    {
                        if (!_mqttClientService.IsConnected)
                        {
                            var subscriptionsCmdResultMessage = new SubscriptionsCmdResultMessage(_mqttClientService, wsClient);
                            _mqttClientService.RegisterApplicationMessageReceivedHandler(subscriptionsCmdResultMessage);

                            await _mqttClientService.Connect(new ConnectionPageViewModel(_mqttClientService)
                            {
                                SessionOptions =
                                {
                                    User = _configuration["Mqtt:User"],
                                    ClientId =  _configuration["Mqtt:ClientId"],
                                    Password =  _configuration["Mqtt:Password"],

                                },
                                ServerOptions =
                                {
                                    Port=int.Parse(_configuration["Mqtt:Port"]),
                                    Host =  _configuration["Mqtt:Host"],
                                    CommunicationTimeout=5000
                                },

                            });
                         
                            //await subscriptionsCmdResultMessage.CreateSubscription(_configuration["Mqtt:SubscribeTopic"]);
                            var result = await _mqttClientService.Subscribe(new SubscriptionOptionsPageViewModel()
                            {
                                Topic = _configuration["Mqtt:SubscribeTopic"]
                            });

                            // Since this app is only able to deal with a single subscription at a time
                            // we can show the result in a 1:1 base.
                            var resultItem = result.Items.First();

                            var resultViewModel = new SubscribeResultViewModel
                            {
                                Topic = resultItem.TopicFilter.Topic,
                                Response = resultItem.ResultCode.ToString(),
                                ResponseCode = ((int)resultItem.ResultCode).ToString(),
                                Succeeded = resultItem.ResultCode <= MqttClientSubscribeResultCode.GrantedQoS2
                            };

                            Console.WriteLine(JsonConvert.SerializeObject(resultViewModel));
                            //_mqttClientService.RegisterApplicationMessageReceivedHandler(subscriptionsCmdResultMessage);
                            //await _mqttClientService.Subscribe(new SubscriptionOptionsPageViewModel()
                            //{
                            //    Topic = _configuration["Mqtt:SubscribeTopic"]
                            //});
                        }

                        await Handle(wsClient);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Echo websocket client {0} err .", clientId);
                        await context.Response.WriteAsync("closed");
                    }
                }
                else
                {
                    context.Response.StatusCode = 404;
                }
            }
            else
            {
                await _next(context);
            }
        }

        private async Task Handle(WebsocketClient webSocket)
        {
            WebsocketClientCollection.Add(webSocket);
            _logger.LogInformation($"Websocket client added.");

            WebSocketReceiveResult result = null;
            do
            {
                var buffer = new byte[1024 * 1];
                result = await webSocket.WebSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Text && !result.CloseStatus.HasValue)
                {
                    var msgString = Encoding.UTF8.GetString(buffer);
                    _logger.LogInformation($"Websocket client ReceiveAsync message {msgString}.");

                    Message message = new Message();
                    try
                    {
                        message = JsonConvert.DeserializeObject<Message>(msgString);
                        if (string.IsNullOrEmpty(message?.cmd?.Data)) continue;
                        message.action = "execute";
                    }
                    catch (Exception e)
                    {
                        message = new Message();
                        message.msg = "error";
                        //Console.WriteLine(e);
                        continue;
                        //throw;
                    }

                    if (message == null)
                    {
                        message = new Message();
                        message.msg = "null message";
                        message.action = "no";
                        continue;
                    }

                    message.SendClientId = webSocket.Id;
                    MessageRoute(message);
                }
            }
            while (!result.CloseStatus.HasValue);

            if (WebsocketClientCollection.Contain(webSocket))
            {
                WebsocketClientCollection.Remove(webSocket);
                _logger.LogInformation($"Websocket client closed.");
            }
        }

        private void MessageRoute(Message message)
        {
            var client = WebsocketClientCollection.Get(message.SendClientId);
            switch (message.action)
            {
                case "execute":
                    client.RoomNo = message.msg;
                    client.SendMessageAsync($"{message.nick} 已推送命令到服务器.");
                    //Task.CompletedTask(() => );
                    var result = _mqttClientService.Publish(new PublishOptionsViewModel(_mqttClientService)
                    {
                        Payload = message.cmd.Data,
                        Topic = _configuration["Mqtt:PublishTopic"]
                    }).Result;

                    _logger.LogInformation($"Websocket client {message.SendClientId} join room {client.RoomNo}.");
                    break;
                case "join":
                    client.RoomNo = message.msg;
                    client.SendMessageAsync($"{message.nick} join room {client.RoomNo} success .");
                    _logger.LogInformation($"Websocket client {message.SendClientId} join room {client.RoomNo}.");
                    break;
                case "send_to_room":
                    if (string.IsNullOrEmpty(client.RoomNo))
                    {
                        break;
                    }
                    var clients = WebsocketClientCollection.GetRoomClients(client.RoomNo);
                    clients.ForEach(c =>
                    {
                        c.SendMessageAsync(message.nick + " : " + message.msg);
                    });
                    _logger.LogInformation($"Websocket client {message.SendClientId} send message {message.msg} to room {client.RoomNo}");

                    break;
                case "leave":
                    var roomNo = client.RoomNo;
                    client.RoomNo = "";
                    client.SendMessageAsync($"{message.nick} leave room {roomNo} success .");
                    _logger.LogInformation($"Websocket client {message.SendClientId} leave room {roomNo}");
                    break;
                default:
                    break;
            }
        }
    }
}
