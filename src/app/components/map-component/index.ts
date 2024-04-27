import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { BaseComponent } from '../../base/baseComponent';
import { UserService } from "../../services/user.service";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';

@Component({
  selector: '[map-component]',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class MapComponent extends BaseComponent implements OnInit {

  map: google.maps.Map | undefined;
  mapClickListener: any;
  zoom: number = 12;
  latitude: number = 21.0278;
  longitude: number = 105.8342;

  @Input() latLng = { lat: 21.0278, lng: 105.8342 };
  @Output() placeChanged = new EventEmitter();

  autoComplete: google.maps.places.Autocomplete | undefined;

  override ngOnInit(): void {
    super.ngOnInit();
    this.latitude = this.latLng.lat;
    this.longitude = this.latLng.lng;
  }

  constructor(private notification: NzNotificationService,
    private router: Router,
    private userService: UserService,
    private zone: NgZone) {
      super(notification, router, userService);
  }

  mapReadyHandler(map: google.maps.Map) {
    this.map = map;
    this.mapClickListener = this.map.addListener('click', (e: google.maps.MouseEvent) => {
      this.zone.run(() => {
        this.latitude = e.latLng.lat();
        this.longitude = e.latLng.lng();  
        this.placeChanged.emit({lat: this.latitude, lng: this.longitude})
      });
    });
  }

}
