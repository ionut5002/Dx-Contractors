import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, setDoc, getDoc, query, limit, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { JobService } from '../Jobs/job.service';
import { JobReport } from './job-report.model';

@Injectable({
  providedIn: 'root'
})
export class JobReportService {
  private jobReportCollection: any;

  constructor(private firestore: Firestore, private jobService: JobService) {
      this.jobReportCollection = collection(this.firestore, 'jobReports');
  }

  getJobReports(): Observable<JobReport[]> {
    const jobReportQuery = query(
        this.jobReportCollection,
        orderBy('date', 'desc'), // Order by Date field in descending order
        limit(1000) // Limit to 1000 documents
      );
      return collectionData(jobReportQuery, { idField: 'id' }) as Observable<JobReport[]>;
  }

  async addJobReport(jobReport: JobReport): Promise<any> {
      const jobReportDoc = doc(this.jobReportCollection);
      const jobReportId = jobReportDoc.id;
      jobReport.id = jobReportId;
  
      // Add the jobReport to Firestore
      await setDoc(jobReportDoc, jobReport);
  
     if (jobReport.jobId) {
       // Update the job's jobReports list
       const jobDoc = doc(this.firestore, 'jobs', jobReport.jobId);
       const jobSnapshot = await getDoc(jobDoc);
       if (jobSnapshot.exists()) {
           const jobData = jobSnapshot.data();
           const updatedJobReports = jobData ? jobData['jobReports'] : [];
           updatedJobReports.push({
               id: jobReportId,
               url: jobReport.PDFUrl,
               amount: jobReport.totalExclVAT,
               sent: jobReport.Sent,

           });
           await updateDoc(jobDoc, { jobReports: updatedJobReports, jobReportd: jobReport.type });
       }
     }
  }
  
  async updateJobReport(jobReportId: string, jobReport: JobReport): Promise<any> {
      // Update the jobReport in Firestore
      await updateDoc(doc(this.firestore, 'jobReports', jobReportId), { ...jobReport });
  
      if (jobReport.jobId) {
          // Update the job's jobReports list
      const jobDoc = doc(this.firestore, 'jobs', jobReport.jobId);
      const jobSnapshot = await getDoc(jobDoc);
      if (jobSnapshot.exists()) {
          const jobData = jobSnapshot.data();
          const updatedJobReports = jobData['jobReports'].map((inv: any) => {
              if (inv.id === jobReportId) {
                  return {
                      id: jobReportId,
                      url: jobReport.PDFUrl,
                      amount: jobReport.totalExclVAT,
                      sent: jobReport.Sent,
                  };
              }
              return inv;
          });
          await updateDoc(jobDoc, { jobReports: updatedJobReports, jobReportd: jobReport.type });
      }
      }
  }
  

  ChangeFieldtoJobReport(jobReportId: string, jobReport: any): Promise<any> {
    return updateDoc(doc(this.firestore, 'jobReports', jobReportId), { ...jobReport });
}

async deleteJobReport(jobReport: JobReport): Promise<any> {
  if (jobReport.jobId) {
      // 1. Fetch the job associated with the jobReport
  const jobId = jobReport.jobId;
  const jobDocRef = doc(this.firestore, 'jobs', jobId);
  const jobSnapshot = await getDoc(jobDocRef);
  const jobData = jobSnapshot.data();

  if (jobData) {
      // 2. Update the job's jobReports array to remove the jobReport with the given jobReportId
      const updatedJobReports = jobData['jobReports'].filter((inv: any) => inv.id !== jobReport.id);
      await updateDoc(jobDocRef, { jobReports: updatedJobReports });
  }
  }

  // 3. Delete the jobReport from the jobReports collection
  return deleteDoc(doc(this.firestore, 'jobReports', jobReport.id));
}
}
