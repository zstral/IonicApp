import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-camera-tab',
  templateUrl: './camera-tab.page.html',
  styleUrls: ['./camera-tab.page.scss'],
  standalone: false,
})

export class CameraTabPage implements OnInit {

  photo: SafeResourceUrl | undefined;

  constructor(
    private sanitizer: DomSanitizer,
    private platform: Platform
  ) { }

  ngOnInit() {
    this.requestPermissions();
  }

  async requestPermissions() {
    try {
      const permissionStatus = await Camera.requestPermissions({
        permissions: ['camera', 'photos']
      });
      console.log('Permisos de la cámara:', permissionStatus);
    } catch (error) {
      console.error('Error al solicitar permisos de la cámara:', error);
    }
  }

  async takePhoto() {
    try {
      const capturedPhoto = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      if (capturedPhoto && capturedPhoto.webPath) {
        this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(capturedPhoto.webPath);
        console.log('Foto tomada y lista para mostrar:', capturedPhoto.webPath);
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      this.photo = undefined;
    }
  }
}