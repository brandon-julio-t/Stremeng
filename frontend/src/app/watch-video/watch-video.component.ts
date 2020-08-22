import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { VideoService } from '../video.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-watch-video',
  templateUrl: './watch-video.component.html',
  styleUrls: ['./watch-video.component.scss'],
})
export class WatchVideoComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private videoService: VideoService
  ) {}

  baseUrl: string = 'http://localhost:3000/video';
  id: string = '';

  error: boolean = false;
  feedback: string = '';

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.videoService.getVideoById(this.id).subscribe(
      (e) => {
        this.error = false;
        this.feedback = '';
        console.log(e);
      },
      (error: HttpErrorResponse) => {
        if (error.status !== 200) {
          this.error = true;
          this.feedback = error.error;
        }
      }
    );
  }

  getVideoPath = (): string => `${this.baseUrl}/${this.id}`;
}
