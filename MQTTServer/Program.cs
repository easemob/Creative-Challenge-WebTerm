using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Client.Connecting;
using MQTTnet.Client.Disconnecting;
using MQTTnet.Client.Options;
using MQTTnet.Client.Receiving;
using MQTTnet.Client.Subscribing;
using MQTTnet.Protocol;
using Renci.SshNet;

namespace MQTTConsole
{
    class Program
    {
        /// <summary>
        /// 客户端
        /// </summary>
        /// <param name="args"></param>
        /// <returns></returns>
        static async Task Main(string[] args)
        {
            //MQTT 配置
            var ClientId = "ct3@v0atj0";
            var Password =
                "YWMtGGTjOgS5Eey7-lEGqIvevNNFtaTuGkJZrtTnGbPw-gKNLDFwAYMR7K4hbQAtUIybAwMAAAF7d1-P3ABPGgDbc5RJBfjWc3ES0Zw-W60gwLFKLCIAnPAU9RXgRp1zoA";
            var Host = "v0atj0.cn1.mqtt.chat";
            var Port = "1883";
            var User = "user1";
            var PublishTopic = "top2";
            var SubscribeTopic = "top1";

            //SSH 配置
            var SSHHost= "";
            var SSHUser = "root";
            var SSHPassword = "";



            var optionbuilder = new MqttClientOptionsBuilder()
                .WithClientId(ClientId)
                .WithTcpServer(Host, 1883)
                .WithCredentials(User, Password);

        
            var mqttClient = new MqttFactory().CreateMqttClient();

            var ret = await mqttClient.ConnectAsync(optionbuilder.Build());
            Console.WriteLine($"client_1 result : {ret.ResultCode}");

          

            var subcriberet = await mqttClient.SubscribeAsync(new MqttClientSubscribeOptions()
            {
                TopicFilters = new List<MqttTopicFilter>
                {
                    new MqttTopicFilter()
                    {
                        Topic = SubscribeTopic
                    }
                }
            });
            foreach (var item in subcriberet.Items)
            {
                Console.WriteLine($"Topic:{item.TopicFilter.Topic}, result:{item.ResultCode}");
            }

            mqttClient.UseApplicationMessageReceivedHandler((e) =>
            {
                var msg = e.ApplicationMessage;
                var topic = msg.Topic;
                var payload = msg.ConvertPayloadToString();
                Console.WriteLine($"1. 接收到远程命令 clientId:{e.ClientId}, topic:{topic}");
                Console.WriteLine($" 执行命令：{payload}");

                using (var sshClient = new SshClient(SSHHost, 22, SSHUser, SSHPassword))
                {
                    sshClient.Connect();
                    //using (var cmd = sshClient.CreateCommand("ls -l"))
                    using (var cmd = sshClient.CreateCommand(payload))
                    {
                        var res = cmd.Execute();
                        var output = cmd.Result;
                        var err = cmd.Error;
                        var stat = cmd.ExitStatus;
                        Console.WriteLine($"2. 执行命令结果:{output}");
                        var re= mqttClient.PublishAsync(new MqttApplicationMessage()
                        {
                            Topic = PublishTopic,
                            Payload = Encoding.UTF8.GetBytes(output)

                        }, CancellationToken.None).Result;
                        Console.WriteLine($"3. mqtt推送给client");
                    }
                }
            });

            while (true)
            {
                //var input = Console.ReadLine().ToLower().Trim();
                await Task.Delay(100);
                var input = "";
                switch (input)
                {
                    case "exit":
                        mqttClient.Dispose();
                        return;
                    default:
                        break;
                }
            }
        }
    }

}
