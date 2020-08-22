import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Video } from './models/video';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  baseUrl: string = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.baseUrl}/videos`);
  }

  getVideoById(id: string): Observable<Video> {
    return this.http.get<Video>(`${this.baseUrl}/video/${id}`);
  }

  submitVideo(video: Video): Observable<any> {
    var formData = new FormData();
    formData.append('title', video.title);
    formData.append('description', video.description);
    formData.append('file', video.file);

    return this.http.post(`${this.baseUrl}/video/create`, formData);
  }

  deleteVideo(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/video/${id}`);
  }
}
