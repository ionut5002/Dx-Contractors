import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  private progressSubject = new Subject<number>();

  constructor(private storage: Storage) { }

  async uploadMultipleFiles(files: FileList, type: string): Promise<any[]> {
    const allMetadata: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file) {
        const randomString = Math.random().toString(36).substring(2, 8);
        const filePath =  `${type}/${randomString}_${file.name}`;
        const storageRef = ref(this.storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.progressSubject.next(progress);
        });

        await uploadTask.then(async () => {
          const downloadURL = await getDownloadURL(storageRef);
          allMetadata.push({
            fileName: `${randomString}_${file.name}`,
            fileURL: downloadURL
          });
        });
      }
    }

    this.progressSubject.complete();
    return allMetadata;
  }

  getProgress(): Observable<number> {
    return this.progressSubject.asObservable();
  }

  async removeFile(fileName: string, type: string): Promise<void> {
    const storageRef = ref(this.storage, `${type}/${fileName}`);
    await deleteObject(storageRef);
  }
}