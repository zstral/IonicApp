import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Platform } from '@ionic/angular';
import * as L from 'leaflet';
import { ApiClientService, ApiUser } from 'src/app/services/apiclient.service';

@Component({
  selector: 'app-map-tab',
  templateUrl: './map-tab.page.html',
  styleUrls: ['./map-tab.page.scss'],
  standalone: false,
})

export class MapTabPage implements OnInit, OnDestroy, AfterViewInit {

  map!: L.Map;
  marker!: L.Marker;

  latitude: number | undefined;
  longitude: number | undefined;
  accuracy: number | undefined;
  timestamp: number | undefined;
  error: string | undefined;
  private watchId: string | undefined;

  apiUsers: ApiUser[] = [];
  selectedApiUser: ApiUser | null = null;
  usersLoading: boolean = false;
  usersError: string | undefined;

  selectedSegment: 'myLocation' | 'apiUsers' = 'myLocation';

  constructor(
    private platform: Platform,
    private apiClientService: ApiClientService
  ) { }

  async ngOnInit() {
    await this.requestPermissions();
  }

  ngAfterViewInit() {
    this.platform.ready().then(() => {
      this.loadMap();
      if (this.selectedSegment === 'myLocation') {
        this.startWatchingLocation();
      }
    });
  }

  ngOnDestroy() {
    this.stopWatchingLocation();
    if (this.map) {
      this.map.remove();
      console.log('Mapa de Leaflet removido al salir de la página.');
    }
  }

  async requestPermissions() {
    try {
      const permissionStatus = await Geolocation.requestPermissions();
      console.log('Permisos de geolocalización:', permissionStatus);
      if (permissionStatus.location === 'denied' || permissionStatus.coarseLocation === 'denied') {
        this.error = 'Permisos de ubicación denegados. Por favor, habilítalos en la configuración de tu dispositivo.';
      }
    } catch (err: any) {
      console.error('Error al solicitar permisos de geolocalización:', err);
      this.error = `Error al solicitar permisos de ubicación: ${err.message}`;
    }
  }

  private loadMap() {

    const initialLat = -33.4569;
    const initialLng = -70.6483;

    if (!this.map) {
      this.map = L.map('osm_map', {
        center: [initialLat, initialLng],
        zoom: 15
      });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.marker = L.marker([initialLat, initialLng], {
      icon: L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(this.map)
      .bindPopup('Tu ubicación actual')
      .openPopup();
      console.log('Mapa de Leaflet cargado e inicializado.');
    }
  }

  private async startWatchingLocation() {
    this.stopWatchingLocation(); 

    try {
      this.watchId = await Geolocation.watchPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }, (position: Position | null, err?: any) => {
        if (err) {
          console.error('Error al observar la ubicación:', err);
          this.error = `Error al obtener ubicación: ${err.message}`;
          this.latitude = undefined;
          this.longitude = undefined;
          this.accuracy = undefined;
          this.timestamp = undefined;
          return;
        }

        if (position) {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.accuracy = position.coords.accuracy;
          this.timestamp = position.timestamp;
          this.error = undefined;

          const newLatLng = new L.LatLng(this.latitude, this.longitude);

          this.marker.setLatLng(newLatLng);

          this.map.setView(newLatLng, this.map.getZoom());

          this.marker.setPopupContent(`<b>Tu ubicación</b><br>Lat: ${this.latitude.toFixed(5)}<br>Lng: ${this.longitude.toFixed(5)}`).openPopup();

          console.log(`Ubicación actualizada: Lat ${this.latitude}, Lng ${this.longitude}`);
        }
      });
      console.log('Comenzando a observar la ubicación. Watch ID:', this.watchId);
    } catch (err: any) {
      console.error('Error al iniciar la observación de la ubicación:', err);
      this.error = `No se pudo iniciar la observación de ubicación: ${err.message}`;
    }
  }

  private stopWatchingLocation() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = undefined;
      console.log('Detenida la observación de la ubicación.');
    }
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
    if (this.selectedSegment === 'myLocation') {
      this.stopWatchingLocation();
      this.loadApiUsers();
      this.resetMarkerToMyLocation();

      if (!this.latitude || !this.longitude) {
         this.startWatchingLocation();
      } else {
         const myLatLng = new L.LatLng(this.latitude, this.longitude);
         this.map.setView(myLatLng, this.map.getZoom());
         this.marker.setPopupContent(`<b>Mi Ubicación</b><br>Lat: ${this.latitude.toFixed(5)}<br>Lng: ${this.longitude.toFixed(5)}`).openPopup();
      }

    } else if (this.selectedSegment === 'apiUsers') {
      this.stopWatchingLocation();
      this.loadApiUsers();

      if (this.selectedApiUser) {
        this.selectApiUser(this.selectedApiUser);
      } else if (this.apiUsers.length > 0) {
        
        this.selectApiUser(this.apiUsers[0]);
      } else {
        
        this.map.setView(new L.LatLng(0, 0), 2);
        this.marker.setLatLng(new L.LatLng(0,0));
        this.marker.setPopupContent('Selecciona un usuario').openPopup();
      }
    }
  }

  loadApiUsers() {
    this.usersLoading = true;
    this.usersError = undefined;
    this.apiClientService.getUsers().subscribe({
      next: (data) => {
        this.apiUsers = data;
        this.usersLoading = false;
        console.log('Usuarios de API cargados:', this.apiUsers);
        
        if (!this.selectedApiUser && this.apiUsers.length > 0) {
          this.selectApiUser(this.apiUsers[0]);
        }
      },
      error: (err) => {
        console.error('Error al obtener usuarios de API:', err);
        this.usersError = 'No se pudieron cargar los usuarios de la API.';
        this.usersLoading = false;
      }
    });
  }

  selectApiUser(user: ApiUser) {
    this.selectedApiUser = user;
    const lat = parseFloat(user.address.geo.lat);
    const lng = parseFloat(user.address.geo.lng);

    if (!isNaN(lat) && !isNaN(lng)) {
      const userLatLng = new L.LatLng(lat, lng);
      this.marker.setLatLng(userLatLng);
      this.map.setView(userLatLng, 12);
      this.marker.setPopupContent(`<b>${user.name}</b><br>${user.address.city}, ${user.address.street}`).openPopup();
    } else {
      console.warn('Coordenadas de usuario inválidas:', user.name, user.address.geo.lat, user.address.geo.lng);
      this.marker.setPopupContent(`Coordenadas no válidas para ${user.name}`);
    }
  }

  private resetMarkerToMyLocation() {
    if (this.latitude && this.longitude) {
      const myLatLng = new L.LatLng(this.latitude, this.longitude);
      this.marker.setLatLng(myLatLng);
      this.map.setView(myLatLng, this.map.getZoom());
      this.marker.setPopupContent(`<b>Mi Ubicación</b><br>Lat: ${this.latitude.toFixed(5)}<br>Lng: ${this.longitude.toFixed(5)}`).openPopup();
    } else {
      
      this.map.setView(new L.LatLng(-33.4569, -70.6483), 15);
      this.marker.setLatLng(new L.LatLng(-33.4569, -70.6483));
      this.marker.setPopupContent('Obteniendo ubicación...');
    }
  }

}