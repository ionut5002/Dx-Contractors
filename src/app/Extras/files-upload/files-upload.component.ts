import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { FilesService } from '../files.service';
@Component({
  selector: 'app-files-upload',
  templateUrl: './files-upload.component.html',
  styleUrls: ['./files-upload.component.scss']
})
export class FilesUploadComponent {
  files: FileList | null = null;
  uploadedFiles: any;
  isUploadComplete = false;
  uploadProgress$?: Observable<number>;

  constructor(
    public dialogRef: MatDialogRef<FilesUploadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, // data coming from parent
    private filesService: FilesService
  ) { }

  ngOnInit(): void {
    this.uploadProgress$ = this.filesService.getProgress();
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.files = input.files;
    if (this.files) {
      this.filesService.uploadMultipleFiles(this.files, this.data.type).then(uploadMetadata => {
        if (uploadMetadata) {
          this.uploadedFiles = uploadMetadata
          this.isUploadComplete = true;
        }
      });
    }
  }

  onConfirm(): void {
    if (this.isUploadComplete) {
      this.dialogRef.close(this.uploadedFiles); // data going back to parent
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}