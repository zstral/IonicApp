import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Platform } from '@ionic/angular';
import * as L from 'leaflet';
import { ApiClientService, ApiUser } from 'src/app/services/apiclient.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map-tab',
  templateUrl: './map-tab.page.html',
  styleUrls: ['./map-tab.page.scss'],
  standalone: false,
})
export class MapTabPage implements OnInit, OnDestroy, AfterViewInit {

  map!: L.Map;
  marker!: L.Marker;
  private apiUserMarkers: L.Marker[] = [];

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

  selectedSegment: string = 'myLocation';

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
    });
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter: La vista está completamente visible.');
    if (this.map) {
      this.map.invalidateSize();
      console.log('Mapa: invalidateSize() ejecutado en ionViewDidEnter.');

      if (this.selectedSegment === 'myLocation') {
        if (this.latitude !== undefined && this.longitude !== undefined) {
          this.map.setView(new L.LatLng(this.latitude, this.longitude), 15);
        } else {
          this.startWatchingLocation();
          this.map.setView(new L.LatLng(-33.4569, -70.6483), 15);
        }
        this.resetMarkerToMyLocation();
      } else if (this.selectedSegment === 'apiUsers') {
        this.addApiUserMarkers();
        if (this.selectedApiUser) {
          const lat = parseFloat(this.selectedApiUser.address.geo.lat);
          const lng = parseFloat(this.selectedApiUser.address.geo.lng);
          if (!isNaN(lat) && !isNaN(lng)) {
            this.map.setView(new L.LatLng(lat, lng), 12);
          }
        } else if (this.apiUsers.length > 0) {
          this.selectApiUser(this.apiUsers[0]);
        } else {
          this.map.setView(new L.LatLng(0, 0), 2);
        }
      }
    }
  }

  ngOnDestroy() {
    this.stopWatchingLocation();
    if (this.map) {
      this.map.remove();
      console.log('Mapa de Leaflet removido al salir de la página.');
    }
    this.clearApiUserMarkers();
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
      const mapElement = document.getElementById('osm_map');
      if (!mapElement) {
        console.error('Error: El elemento #osm_map no se encontró en el DOM.');
        return;
      }

      this.map = L.map(mapElement, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      L.control.zoom({ position: 'bottomright' }).addTo(this.map);

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

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          console.log('Mapa: invalidateSize() ejecutado en loadMap (setTimeout).');
        }
      }, 0);
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

          if (this.latitude !== undefined && this.longitude !== undefined) {
            const newLatLng = new L.LatLng(this.latitude, this.longitude);
            this.marker.setLatLng(newLatLng);

            if (this.selectedSegment === 'myLocation') {
              this.map.setView(newLatLng, this.map.getZoom());
            }

            this.marker.setPopupContent(`<b>Tu ubicación</b><br>Lat: ${this.latitude.toFixed(5)}<br>Lng: ${this.longitude.toFixed(5)}`).openPopup();
            console.log(`Ubicación actualizada: Lat ${this.latitude}, Lng ${this.longitude}`);
          }
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
    console.log('Segmento cambiado a:', this.selectedSegment);

    this.stopWatchingLocation();
    this.clearApiUserMarkers();

    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
        console.log('Mapa: invalidateSize() ejecutado en segmentChanged.');
      }, 50);
    }

    if (this.selectedSegment === 'myLocation') {
      this.startWatchingLocation();
      this.resetMarkerToMyLocation();
      if (this.latitude !== undefined && this.longitude !== undefined) {
        const myLatLng = new L.LatLng(this.latitude, this.longitude);
        this.map.setView(myLatLng, this.map.getZoom());
      } else {
        this.map.setView(new L.LatLng(-33.4569, -70.6483), 15);
      }
    } else if (this.selectedSegment === 'apiUsers') {
      this.loadApiUsers();
    }
  }

  loadApiUsers() {
    this.usersLoading = true;
    this.usersError = undefined;
    this.apiUsers = [];
    this.clearApiUserMarkers();

    this.apiClientService.getUsers().subscribe({
      next: (data) => {
        this.apiUsers = data;
        this.usersLoading = false;
        console.log('Usuarios de API cargados:', this.apiUsers);

        this.addApiUserMarkers();

        if (this.apiUsers.length > 0) {
          this.selectApiUser(this.apiUsers[0]);
        } else {
          this.map.setView(new L.LatLng(0, 0), 2);
          this.marker.setLatLng(new L.LatLng(0,0));
          this.marker.setPopupContent('No hay usuarios API').openPopup();
        }
      },
      error: (err) => {
        console.error('Error al obtener usuarios de API:', err);
        this.usersError = 'No se pudieron cargar los usuarios de la API.';
        this.usersLoading = false;
        this.map.setView(new L.LatLng(0, 0), 2);
        this.marker.setLatLng(new L.LatLng(0,0));
        this.marker.setPopupContent('Error al cargar usuarios').openPopup();
      }
    });
  }

  addApiUserMarkers() {
    if (!this.map) return;
    this.clearApiUserMarkers();

    this.apiUsers.forEach(user => {
      const lat = parseFloat(user.address.geo.lat);
      const lng = parseFloat(user.address.geo.lng);

      if (!isNaN(lat) && !isNaN(lng)) {
        const marker = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        }).addTo(this.map)
          .bindPopup(`<b>${user.name}</b><br>${user.address.city}`);
        this.apiUserMarkers.push(marker);
      }
    });

    if (this.apiUserMarkers.length > 0) {
      const group = new (L.featureGroup as any)(this.apiUserMarkers);
      this.map.fitBounds(group.getBounds());
    }
  }

  clearApiUserMarkers() {
    if (this.map) {
      this.apiUserMarkers.forEach(marker => {
        this.map?.removeLayer(marker);
      });
      this.apiUserMarkers = [];
    }
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
    if (this.latitude !== undefined && this.longitude !== undefined) {
      const myLatLng = new L.LatLng(this.latitude, this.longitude);
      this.marker.setLatLng(myLatLng);
      if (this.selectedSegment === 'myLocation') {
        this.map.setView(myLatLng, this.map.getZoom());
      }
      this.marker.setPopupContent(`<b>Mi Ubicación</b><br>Lat: ${this.latitude.toFixed(5)}<br>Lng: ${this.longitude.toFixed(5)}`).openPopup();
    } else {
      const initialLat = -33.4569;
      const initialLng = -70.6483;
      this.marker.setLatLng(new L.LatLng(initialLat, initialLng));
      if (this.selectedSegment === 'myLocation') {
        this.map.setView(new L.LatLng(initialLat, initialLng), 15);
      }
      this.marker.setPopupContent('Obteniendo ubicación...');
      this.marker.openPopup();
    }
  }
}