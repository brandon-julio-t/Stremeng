import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { VideoService } from '../video.service';
import { HttpErrorResponse } from '@angular/common/http';

import { Video } from '../models/video';

@Component({
  selector: 'app-video-form',
  templateUrl: './video-form.component.html',
  styleUrls: ['./video-form.component.scss'],
})
export class VideoFormComponent implements OnInit {
  videoForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    file: ['', Validators.required],
  });

  success: boolean = false;
  error: boolean = false;
  feedback: string = '';

  videos: Video[] = [];

  constructor(private fb: FormBuilder, private videoService: VideoService) {}

  ngOnInit(): void {
    this.fetchVideos();
  }
  
  fetchVideos(): void {
    this.videoService
      .getVideos()
      .subscribe((videos) => (this.videos = videos), this.onError);
  }

  onSubmit(): void {
    this.videoForm.markAllAsTouched();

    if (this.videoForm.valid) {
      this.error = false;
      this.success = true;
      this.feedback = 'Upload success.';

      this.videoService
        .submitVideo(this.videoForm.value)
        .subscribe(() => this.fetchVideos(), this.onError);
    }

    this.resetFeedbackStateInFiveSeconds();
  }

  onError(error: HttpErrorResponse): void {
    this.error = true;
    this.success = false;
    this.feedback = error.error;
  }

  resetFeedbackStateInFiveSeconds() {
    setTimeout(() => {
      this.success = this.error = false;
      this.feedback = '';
    }, 5000);
  }

  deleteVideo(id: string) {
    this.videoService.deleteVideo(id).subscribe(() => {
      this.fetchVideos();

      this.success = true;
      this.feedback = 'Video deleted.';

      this.resetFeedbackStateInFiveSeconds();
    });
  }
}
