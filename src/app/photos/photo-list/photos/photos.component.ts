import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Photo } from '../../photo/photo';

@Component({
  selector: 'ap-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.css']
})
export class PhotosComponent implements OnChanges {

<<<<<<< HEAD
  @Input() photos: Photo[] = [];

=======
  @Input() photos: Photo[] = []
>>>>>>> ea67afe1f4afa429bff8b4acca9e8c51c22f5ad5
  rows: any[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if(changes.photos) {
      this.rows = this.groupColumns(this.photos);
    }
  }

  groupColumns(photos: Photo[]) {
    const newRows = [];

<<<<<<< HEAD
  ngOnChanges(changes: SimpleChanges) {
    if(changes.photos) {
      this.rows = this.groupColumns(this.photos);
    }
  }

  groupColumns(photos: Photo[]) {
      const newRows = [];

      for(let index = 0; index < photos.length; index+=3) {
          newRows.push(photos.slice(index, index + 3));
      }
      return newRows;
=======
    for(let index = 0; index < photos.length; index+=3) {
        newRows.push(photos.slice(index, index + 3));
    }
    return newRows;
>>>>>>> ea67afe1f4afa429bff8b4acca9e8c51c22f5ad5
  }

}
