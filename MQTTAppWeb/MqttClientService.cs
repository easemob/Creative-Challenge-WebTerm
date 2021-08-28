using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Text.Unicode;
using System.Threading.Tasks;
using Avalonia.Controls;
using Avalonia.Threading;
using MQTTnet;
using MQTTnet.App;
using MQTTnet.App.Common;
using MQTTnet.App.Pages.Subscriptions;
using MQTTnet.App.Services.Client;
using MQTTnet.Client.Receiving;

namespace MQTTAppWeb
{
    public class MqttClientService1
    {

    }
    //public sealed class SubscriptionsCmdResultMessage : IMqttApplicationMessageReceivedHandler
    //{

    //    int _messageId;
    //    public Task HandleApplicationMessageReceivedAsync(MqttApplicationMessageReceivedEventArgs eventArgs)
    //    {
        
    //        return Dispatcher.UIThread.InvokeAsync(() =>
    //        {
    //            Console.WriteLine("receive sss");
    //            //ReceivedApplicationMessages.Add(new ReceivedApplicationMessageViewModel(_messageId++, eventArgs.ApplicationMessage));
    //        });
    //    }
      
    //}

    public sealed class SubscriptionsCmdResultMessage : BasePageViewModel, IMqttApplicationMessageReceivedHandler
    {
        readonly MqttClientService _mqttClientService;
        readonly WebsocketClient _webSocketClient;
      
        int _messageId;


        public SubscriptionsCmdResultMessage(MqttClientService mqttClientService, WebsocketClient webSocketClient)
        {
            _mqttClientService = mqttClientService ?? throw new ArgumentNullException(nameof(mqttClientService));

            mqttClientService.RegisterApplicationMessageReceivedHandler(this);
            _webSocketClient = webSocketClient;
            Header = "Subscriptions";
        }

        public ViewModelCollection<SubscriptionViewModel> Subscriptions { get; } = new ViewModelCollection<SubscriptionViewModel>();

        public ViewModelCollection<ReceivedApplicationMessageViewModel> ReceivedApplicationMessages { get; } = new ViewModelCollection<ReceivedApplicationMessageViewModel>();

        public Task HandleApplicationMessageReceivedAsync(MqttApplicationMessageReceivedEventArgs eventArgs)
        {
            Console.WriteLine($"receive topic 2 {Encoding.UTF8.GetString(eventArgs.ApplicationMessage.Payload)}");

            _webSocketClient.SendMessageAsync($"收到命令回复：{Encoding.UTF8.GetString(eventArgs.ApplicationMessage.Payload)}");
            return Dispatcher.UIThread.InvokeAsync(() =>
            {
                Console.WriteLine($"receive topic 2 {eventArgs.ApplicationMessage}");
                //ReceivedApplicationMessages.Add(new ReceivedApplicationMessageViewModel(_messageId++, eventArgs.ApplicationMessage));
            });
        }

        public async Task CreateSubscription(string topic)
        {
            try
            {
                var editor = new SubscriptionEditorViewModel(_mqttClientService);

                //var window = new SubscriptionEditorView
                //{
                //    Title = "Create subscription",
                //    WindowStartupLocation = WindowStartupLocation.CenterOwner,
                //    ShowActivated = true,
                //    SizeToContent = SizeToContent.WidthAndHeight,
                //    ShowInTaskbar = false,
                //    CanResize = false,
                //    DataContext = editor
                //};

                //await App.ShowDialog(window);

                if (!editor.Subscribed)
                {
                    return;
                }

                editor.ConfigurationPage.Topic = topic;
                var subscription = new SubscriptionViewModel(editor.ConfigurationPage)
                {
                };

                subscription.UnsubscribedHandler = async () =>
                {
                    //await _mqttClientService.Unsubscribe(editor.Topic);
                    Subscriptions.Remove(subscription);
                };

                Subscriptions.Add(subscription);
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception);
                //App.ShowException(exception);
            }
        }

        public void Clear()
        {
            ReceivedApplicationMessages.Clear();
        }
    }

}
