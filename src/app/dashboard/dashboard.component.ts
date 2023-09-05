import { Component, OnInit } from '@angular/core';
import { AuthService } from '../Auth/auth.service';
import { SharedService } from '../Extras/shared.service';
import { Invoice } from '../Invoices/invoice.model';
import { JobReport } from '../JobReport/job-report.model';
import { Job } from '../Jobs/job.model';
import { Quotation } from '../Quotations/quotation.model';
import { Timestamp } from 'firebase/firestore';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  upcomingJobs = 20;
  ongoingJobs = 30;
  finishedJobs = 40;
  totalInvoices = 30;
  sentInvoices = 20;
  paidInvoices = 20;
  totalJobReports = 30;
  sentJobReports = 40;
  totalQuotations = 50;
  quotationsWithJobId = 30;
  quotationsWithoutJobId = 20;
  totalJobValue = 20;
  totalInvoiceAmount = 20;

  private isFirstVisit = true;

  public jobChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: { x: {}, y: { min: 0 } },
    plugins: { legend: { display: true } },
  };

  public invoiceChartOptions: ChartConfiguration['options'] = this.jobChartOptions;
  public jobReportChartOptions: ChartConfiguration['options'] = this.jobChartOptions;
  public quotationChartOptions: ChartConfiguration['options'] = this.jobChartOptions;

  public barChartType: ChartType = 'bar';
  public barChartPlugins = [];

  public jobChartData: ChartData<'bar'> = {
    labels: ['Upcoming', 'Ongoing', 'Finished'],
    datasets: [{ data: [this.upcomingJobs, this.ongoingJobs, this.finishedJobs], label: 'Jobs', backgroundColor: ['red', 'blue', 'green']}],
  };

  public invoiceChartData: ChartData<'bar'> = {
    labels: ['Total', 'Sent', 'Paid'],
    datasets: [{ data: [this.totalInvoices, this.sentInvoices, this.paidInvoices], label: 'Invoices' }],
  };

  public jobReportChartData: ChartData<'bar'> = {
    labels: ['Total', 'Sent'],
    datasets: [{ data: [this.totalJobReports, this.sentJobReports], label: 'Job Reports' }],
  };

  public quotationChartData: ChartData<'bar'> = {
    labels: ['Total', 'With Job ID', 'Without Job ID'],
    datasets: [{ data: [this.totalQuotations, this.quotationsWithJobId, this.quotationsWithoutJobId], label: 'Quotations' }],
  };

  constructor(private sharedService: SharedService, public auth: AuthService) { }

  ngOnInit(): void {
    if (this.isFirstVisit) {
      this.sharedService.fetchJobs();
      this.sharedService.fetchInvoices();
      this.sharedService.fetchQuotations();
      this.sharedService.fetchJobReports();
      this.sharedService.fetchClients();
      this.sharedService.fetchUsers();
      this.isFirstVisit = false;
    }

    this.sharedService.getJobs().subscribe((jobs: Job[]) => {
      this.upcomingJobs = jobs.filter(job => new Date() < (job.startDate instanceof Timestamp ? job.startDate.toDate() : job.startDate)).length;
      this.ongoingJobs = jobs.filter(job => new Date() >= (job.startDate instanceof Timestamp ? job.startDate.toDate() : job.startDate) && new Date() <= (job.endDate instanceof Timestamp ? job.endDate.toDate() : job.endDate)).length;
      this.finishedJobs = jobs.filter(job => new Date() > (job.endDate instanceof Timestamp ? job.endDate.toDate() : job.endDate)).length;
      this.totalJobValue = jobs.reduce((acc, job) => acc + job.jobValue, 0);
      this.jobChartData = {
        labels: ['Upcoming', 'Ongoing', 'Finished'],
        datasets: [{ data: [this.upcomingJobs, this.ongoingJobs, this.finishedJobs], label: 'Jobs',backgroundColor: ['red', 'blue', 'green'] }],
      };
    });

    this.sharedService.getInvoices().subscribe((invoices: Invoice[]) => {
      this.totalInvoices = invoices.length;
      this.sentInvoices = invoices.filter(invoice => invoice.Sent).length;
      this.paidInvoices = invoices.filter(invoice => invoice.Paid).length;
      this.totalInvoiceAmount = invoices.reduce((acc, invoice) => acc + invoice.totalInclVAT, 0);
      this.invoiceChartData = {
        labels: ['Total', 'Sent', 'Paid'],
        datasets: [{ data: [this.totalInvoices, this.sentInvoices, this.paidInvoices], label: 'Invoices', backgroundColor: ['red', 'blue', 'green'] }],
      };
    });

    this.sharedService.getJobReports().subscribe((jobReports: JobReport[]) => {
      this.totalJobReports = jobReports.length;
      this.sentJobReports = jobReports.filter(jobReport => jobReport.Sent).length;
      this.jobReportChartData = {
        labels: ['Total', 'Sent'],
        datasets: [{ data: [this.totalJobReports, this.sentJobReports], label: 'Job Reports',backgroundColor: ['red', 'blue'] }],
      };
      this.quotationChartData = {
        labels: ['Total', 'With Job ID', 'Without Job ID'],
        datasets: [{ data: [this.totalQuotations, this.quotationsWithJobId, this.quotationsWithoutJobId], label: 'Quotations', backgroundColor: ['red', 'blue', 'green'] }],
      };
    });

    this.sharedService.getQuotations().subscribe((quotations: Quotation[]) => {
      this.totalQuotations = quotations.length;
      this.quotationsWithJobId = quotations.filter(quotation => quotation.jobId).length;
      this.quotationsWithoutJobId = quotations.filter(quotation => !quotation.jobId).length;
    });
  }
}
