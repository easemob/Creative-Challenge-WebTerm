##### 基于环信mqtt服务的shell远程命令执行

###### 简介：
 通过MQTT远程执行shell命令
###### 优势：
- 相比传统端到端SSH具有较强解耦和长连接保持的优势，消息也更加持久
- 吞吐量速度提升
- 网络开销降低
- 服务质量上，MQTT支持三种不同级别的服务质量，为不同场景提供消息可靠性：
- 客户端发送消息，推送给未来的订阅者，并支持命令分发执行
###### 使用说明：
![615d4334b6ef7d1d5613b7ee05e24620](D3973F7D-C5B6-488E-8DA3-750CF80C842C.png)

- web-terminal:
 web输入命令端
- MQTT-Client:
 Web客户端后台，监听发布订阅消息，编码命令并推送组装的内容。
- MQTT-Center:
 MQTT 中介端，如：环信
- MQTT-Server:
 MQTT 服务端，接受包含命令的消息，解析命令，SSH方式连接服务器并执行命令。执行完毕发送通知。
 
 
 ##### 引用
 [xterm.js](https://github.com/xtermjs/xterm.js)
 [MQTTnet](https://github.com/chkr1011/MQTTnet)
 

