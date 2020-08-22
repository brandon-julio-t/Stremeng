import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VideoFormComponent } from './video-form/video-form.component';
import { WatchVideoComponent } from './watch-video/watch-video.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: VideoFormComponent },
  { path: 'video/:id', component: WatchVideoComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
