import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
//import { SamsungTvRemote } from 'samsung-tv-remote';
import { Injectable } from '@angular/core';
import { MqttService, IMqttMessage } from 'ngx-mqtt';
import { Subscription } from 'rxjs'
//import {ChildProcessService} from 'ngx-childprocess';


const WebSocket = require('ws');
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
 subs : Subscription;
  message : string = "";
  topic : string = "";
  author : string = "app : ";
  publishM : string = "";
  messageArray = [];
  temp=20;
  keyControl:string='KEY_MENU';
 // ws = new WebSocket('ws://echo.websocket.org');
config = {
   ip: '192.168.5.31' ,// required: IP address of your Samsung Smart TV
     name :  '[Signage] Display 1',
     mac :  '7C:64:56:A1:F2:F8',
     port :  8001,
  timeout :  5000,
};
base64Encode = function(string) {
  return new Buffer(string).toString('base64');
};

  constructor(public navCtrl: NavController,private mqttService: MqttService) {
 
 // this.sendKey();
  }
  sendKey() {
    let key=this.keyControl;
    console.log(key);
    if( key ) {
      const url = `ws://${this.config.ip}:${this.config.port}/api/v2/channels/samsung.remote.control?name=${this.base64Encode(this.config.name)}`;
      let ws = new WebSocket(url, (error) => {
        console.log(new Error(error));
      });
      ws.on('error', (error) => {
        console.log(`Samsung Remote Client:${ error}`);
      });
      ws.on('message', (data, flags) => {
        data = JSON.parse(data);
        if( data.event === 'ms.channel.connect' ) {
          ws.send(JSON.stringify({
            'method': 'ms.remote.control',
            'params': {
              'Cmd': 'Click',
              'DataOfCmd': key,
              'Option': 'false',
              'TypeOfRemote': 'SendRemoteKey'
            }
          }));
          setTimeout(() => {
            ws.close();
          }, 1000);
        }
      });
    }
  };
/*isTvAlive (done) {
    return this._childProcessService.childProcess.exec('ping -c 1 ' + this.config.ip,[], (error, stdout, stderr) => {
            done(error ? false : true);
        });
  };*/
  apagar(){
  	this.publish("reuniones","APAGAR");
  }
  encender(){
  	this.publish("reuniones","ENCENDER");
  }
  autoOn(){
  	this.publish("reuniones","MODO AUTO");
  }
  autoOff(){
  	this.publish("reuniones","MODO MANUAL");
  }
  cambiar(val){
    this.publish("tv",val);
  }
  ambientador(val){
    this.publish("ambient",val);
  }
  modificarTemp(){
     this.publish("ambient",this.temp.toString());
  }

   subscribe( topic : string){
    if(this.subs){
      this.unsubscribe();
    }
    this.messageArray = [];

    this.subs = this.mqttService.observe(topic).subscribe(
      (message : IMqttMessage) => {
        console.log(message);
        this.message = message.payload.toString();
        this.messageArray.push(this.message);
      });

  }
  publish(topic:string, publishM:any) {
    console.log(topic);
    this.mqttService.unsafePublish(topic, publishM);
  }
  unsubscribe(){
    console.log("unsubscribe");
    this.subs.unsubscribe();
  }
}
