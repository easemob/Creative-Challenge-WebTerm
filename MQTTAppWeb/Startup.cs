using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Avalonia.Threading;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MQTTnet.App.Services.Client;
using MQTTnet.AspNetCore;
using MQTTnet.AspNetCore.Extensions;

namespace MQTTAppWeb
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddRazorPages();
            services.AddHostedMqttServer(mqttServer => mqttServer.WithoutDefaultEndpoint())
                .AddMqttConnectionHandler()
                .AddConnections();

            
            //services.AddSingleton<DispatcherTimer>(Ida);
            services.AddSingleton<MqttClientService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseWebSockets(new WebSocketOptions
            {
                KeepAliveInterval = TimeSpan.FromSeconds(60),
                ReceiveBufferSize = 1* 1024
            });
            app.UseMiddleware<WebsocketHandlerMiddleware>();

            app.UseStaticFiles();

            app.UseRouting();


            app.UseEndpoints(endpoints =>
            {
                endpoints.MapRazorPages();
            });
        }
    }
}
