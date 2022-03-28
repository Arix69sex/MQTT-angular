import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
@Component({
  selector: 'app-root',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription;
  topicname: any = 'CO2-concentration';
  concentration = [0, 0, 0];
  totalConcentration = [0, 0, 0];
  isConnected: boolean = false;
  @ViewChild('msglog', { static: true })
  msglog!: ElementRef; 

  constructor(private _mqttService: MqttService) { }

  ngOnInit(): void {
    this.subscribeToTopic()
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  subscribeToTopic(): void {
    for(let i = 0; i < this.concentration.length; i++){
      this.subscription = this._mqttService.observe(this.topicname + `/${i + 1}`).subscribe((message: IMqttMessage) => {
        let payload = message.payload.toString()
        let topic = message.topic
        let id =  +message.topic.substring(message.topic.length - 1)
        this.totalConcentration[id] += +payload
        console.log(payload, topic, id, this.totalConcentration[id])
        this.log('CO2: ' + message.payload.toString() + '<br> for topic: ' + message.topic);
      });
      this.log('subscribed to topic: ' + this.topicname + `/${i + 1}`)
    }
  }

  sendData(id: number): void {
    // use unsafe publish for non-ssl websockets
    this._mqttService.unsafePublish(this.topicname + `/${id+1}`, this.concentration[id].toString(), { qos: 1, retain: true })
    this.concentration[id] = 0
  }
  
  log(message: any): void {
    this.msglog.nativeElement.innerHTML += '<br><hr>' + message;
  }

  clear(): void {
    this.msglog.nativeElement.innerHTML = '';
  }
}