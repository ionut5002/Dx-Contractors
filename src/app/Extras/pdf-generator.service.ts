import { Injectable } from '@angular/core';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Quotation } from '../Quotations/quotation.model';
import { dxLogo } from './DX-Logo';
import { QuotationService } from '../Quotations/quotation.service';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { InvoiceService } from '../Invoices/invoice.service';
import { Invoice } from '../Invoices/invoice.model';
import { JobReport } from '../JobReport/job-report.model';
import { JobReportService } from '../JobReport/job-report.service';
import { HttpClient } from '@angular/common/http';


(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;


@Injectable({
  providedIn: 'root'
})
export class PDFGeneratorService {
  private firebaseFunctionUrl = 'https://us-central1-dx-contractors.cloudfunctions.net/';


  constructor(private storage: Storage, 
    private quotationService: QuotationService, 
    private firestore: Firestore, 
    private invoiceService: InvoiceService, 
    private jobReportService: JobReportService,
    private http: HttpClient) { }


    
  async generateQuotationPdf(quotation: Quotation) {
    const imageDataUrls = await Promise.all(quotation.files.map(file => this.fetchImageAsDataUrl(file.fileURL)));

    const vatRate = 13.5; // in percentage
    const vatValue = quotation.totalInclVAT - quotation.totalExclVAT;

    const documentDefinition: TDocumentDefinitions = {
      content: [
        {
          columns: [
            [
              {
                image: dxLogo,
                width: 300
              },

            ],
            [
              { text: `QUOTATION`, style: 'header', alignment: 'center'},
              { text: `No: ${quotation.quotationNo}`, style: 'subheader', alignment: 'center' },
              { text: `Date: ${new Date((quotation.date as any).seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, alignment: 'center' }

            ]
          ]
        },
        { text: 'DX Fit-Out & Building Contractors Ltd', style: 'subheader' },
        'D15 E036, Dublin, Ireland',
        'T: (01) 437 0947 / M: 087 190 9980',
        'E: info@dxcontractors.com / W: www.dxcontractors.com',
        {
          columns: [
            [
              { text: `To: ${quotation.client.name}`, style: 'subheader' },
              { text: `Contact: ${quotation.client.contact.contactName}` },
              { text: `Email: ${quotation.client.contact.email}` },
              { text: `Phone: ${quotation.client.contact.phone}` }
            ],
          ]
        },
        '\n',
        {
          table: {
            widths: ['*'],
            body: [
              ['Descriptions'].map(header => {
                return { text: header, fillColor: '#FF6B1C', bold: true };
              }),
              ...quotation.descriptions.map(desc => {
                return [
                  {
                    text: [
                      { text: desc.title + '\n', bold: true },
                      desc.text
                    ]
                  }
                ];
              })
            ]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1
          }
        },

        {
          text: 'Materials',
          style: 'sectionHeader',
          fillColor: '#FF6B1C',
          bold: true
        },
        {
          table: {
            widths: ['*', '15%', '15%', '20%'],
            headerRows: 1,
            body: [
              ['Material', 'Quantity', 'Price', 'Total'].map(header => {
                return { text: header, fillColor: '#FF6B1C', bold: true };
              }),
              ...quotation.materials.map(item => {
                return [item.material, item.quantity, `€${item.price}`, `€${item.price * item.quantity}`];
              }),
              ['', '', 'Subtotal:', `€${quotation.totalExclVAT}`],
              ['', '', 'VAT @ 13.5%:', `€${vatValue}`],
              ['', '', 'TOTAL:', `€${quotation.totalInclVAT}`]
            ]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1
          }
        },
      

        {
          ul: [
              "Our policy asks of our clients for an upfront payment of 30% within the first 3 days of starting a job, 30% half way through the job and 40% at the end(or remaining, if extras), payable within 21 days.",
              "A payment plan will be released upon deposit received and contract signed.",
              "Where a project exceeds 20,000EU in cost a scheduled payment plan will be produced.",
              "Different payment plans can also be accepted and agreed upon.",
              "Upon Completion 10% of total agreed cost to be withheld until all snags completed, if needed.",
              "This quote is an accurate measurement of labour & materials. Client may change materials, in contrast estimate may change also.",
              "DX Fit-out & Building Contractors Limited are fully insured and VAT Registered.",
              "Quotation valid for 21 days due to material cost increases.",
              "Floor installation of 3 years guaranteed if considerable lifting or coming apart of laminates by not proper installation, issues regarding installations and Tiles(wall+floor) fitted, water damage excluded.",
              "We offer a 3 Year Certificate of Guarantee on Mechanical/Electrical, along with a Manufacturers Guarantee.",
              "Cert to be provided for any electrical works",
              "Certificate of guarantee to be provided by principal contractor upon completion of works"
          ]
      },
      ...this.getPhotosSection(imageDataUrls),
        {
          text: '',
          pageBreak: 'after'
        },
        {
          image: dxLogo,
          width: 300,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        {
          text: 'DX Fit-Out & Building Contractors Ltd',
          style: 'subheader',
          alignment: 'center',
          bold: true,
          margin: [0, 0, 0, 20]
        },
        {
          text: [
            'D15 E036, Dublin, Ireland\n',
            'T: (01) 437 0947 / M: 087 190 9980\n',
            'E: info@dxcontractors.com / W: www.dxcontractors.com\n',

          ],
          alignment: 'center',
          bold: true,
          margin: [0, 0, 0, 20]
        },
        {
          text: 'Thank you for your business.',
          style: 'thanks',
          margin: [0, 50, 0, 50]
        },
        {
          text: [
            'Our bank details:\n',
            'Ulster Bank, Phibsborough, Dublin 7\n',
            'Account name: DX Fitout & Building Contractors Ltd\n',
            'Sort Code: 985047, AC: 12999808\n',
            'IBAN: IE75ULSB 985047 12999808 BIC: ULSBIE2D'
          ],
          bold: true,
          alignment: 'left',
          style: 'bank'
        }
      ],
      styles: {
        header: {
          fontSize: 24,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          margin: [0, 20, 0, 10]
        },
        thanks: {
          fontSize: 18,
          bold: true
        },
        bank: {
          fontSize: 16,
          bold: true
        },
        photosHeader: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 10] // Adjust as needed for spacing
        }
      }
    };

    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

    pdfDocGenerator.getBlob(blob => {
      const filePath = `quotations/${quotation.quotationNo}.pdf`;
      const storageRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.then(async () => {
        quotation.PDFUrl = await getDownloadURL(storageRef);
        this.quotationService.ChangeFieldtoQuotation(quotation.id, { PDF: true,
          PDFUrl: quotation.PDFUrl})
        console.log('Download URL:', quotation.PDFUrl);
      });
    });
  }

  async removeQuotationPdf(quotation: Quotation): Promise<void> {
    // 1. Remove the PDF from Firebase Storage
    const filePath = `quotations/${quotation.quotationNo}.pdf`;
    const storageRef = ref(this.storage, filePath);
    await deleteObject(storageRef);

    // 2. Update the Firestore document
    const quotationDocRef = doc(this.firestore, 'quotations', quotation.id);
    await updateDoc(quotationDocRef, {
      PDF: false,
      PDFUrl: ''
    });
  }

  async generateInvoicePdf(invoice: Invoice) {
    const imageDataUrls = await Promise.all(invoice.files.map(file => this.fetchImageAsDataUrl(file.fileURL)));
    const vatRate = 13.5; 
    const vatValue = invoice.totalInclVAT - invoice.totalExclVAT;

    const documentDefinition: TDocumentDefinitions = {
      content: [
        {
          columns: [
            [
              {
                image: dxLogo,
                width: 300
              },
            ],
            [
              { text: `INVOICE`, style: 'header', alignment: 'center'},
              { text: `No: ${invoice.invoiceNo}`, style: 'subheader', alignment: 'center' },
              { text: `Date: ${new Date((invoice.date as any).seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, alignment: 'center' }
            ]
          ]
        },
        { text: 'DX Fit-Out & Building Contractors Ltd', style: 'subheader' },
        'D15 E036, Dublin, Ireland',
        'T: (01) 437 0947 / M: 087 190 9980',
        'E: info@dxcontractors.com / W: www.dxcontractors.com',
        {
          columns: [
            [
              { text: `To: ${invoice.client.name}`, style: 'subheader' },
              { text: `Contact: ${invoice.client.contact.contactName}` },
              { text: `Email: ${invoice.client.contact.email}` },
              { text: `Phone: ${invoice.client.contact.phone}` }
            ],
          ]
        },
        '\n',
        { text: `Order Number: ${invoice.orderNumber}`, style: 'subheader' },
        { text: `Vendor Number: ${invoice.vendorNumber}`, style: 'subheader' },
        '\n',
        {
          table: {
            widths: ['*', '15%', '15%', '20%'],
            body: [
              ['Item', 'Quantity', 'Price', 'Total'].map(header => {
                return { text: header, fillColor: '#FF6B1C', bold: true };
              }),
              ...invoice.Items.map(item => {
                return [
                  {
                    stack: [
                      { text: `${item.Item}`, bold: true }, // Making item.Item bold
                      { text: `${item.description}`, margin: [0, 2] } // margin for a little space between Item and description
                    ]
                  },
                  item.quantity,
                  `€${item.price}`,
                  `€${item.price * item.quantity}`
                ];
              }),
              ['', '', 'Subtotal:', `€${invoice.totalExclVAT}`],
              ['', '', 'VAT @ 13.5%:', `€${vatValue}`],
              ['', '', 'TOTAL:', `€${invoice.totalInclVAT}`]
            ]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1
          }
        },
        {
          ul: [
              "Our policy asks of our clients for an upfront payment of 30% within the first 3 days of starting a job, 30% half way through the job and 40% at the end(or remaining, if extras), payable within 21 days.",
              "A payment plan will be released upon deposit received and contract signed.",
              "Where a project exceeds 20,000EU in cost a scheduled payment plan will be produced.",
              "Different payment plans can also be accepted and agreed upon.",
              "Upon Completion 10% of total agreed cost to be withheld until all snags completed, if needed.",
              "This quote is an accurate measurement of labour & materials. Client may change materials, in contrast estimate may change also.",
              "DX Fit-out & Building Contractors Limited are fully insured and VAT Registered.",
              "Quotation valid for 21 days due to material cost increases.",
              "Floor installation of 3 years guaranteed if considerable lifting or coming apart of laminates by not proper installation, issues regarding installations and Tiles(wall+floor) fitted, water damage excluded.",
              "We offer a 3 Year Certificate of Guarantee on Mechanical/Electrical, along with a Manufacturers Guarantee.",
              "Cert to be provided for any electrical works",
              "Certificate of guarantee to be provided by principal contractor upon completion of works"
          ]
      },
      ...this.getPhotosSection(imageDataUrls),
        {
          text: '',
          pageBreak: 'after'
        },
        {
          image: dxLogo,
          width: 300,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        {
          text: 'DX Fit-Out & Building Contractors Ltd',
          style: 'subheader',
          alignment: 'center',
          bold: true,
          margin: [0, 0, 0, 20]
        },
        {
          text: [
            'D15 E036, Dublin, Ireland\n',
            'T: (01) 437 0947 / M: 087 190 9980\n',
            'E: info@dxcontractors.com / W: www.dxcontractors.com\n',

          ],
          alignment: 'center',
          bold: true,
          margin: [0, 0, 0, 20]
        },
        {
          text: 'Thank you for your business.',
          style: 'thanks',
          margin: [0, 50, 0, 50]
        },
        {
          text: [
            'Our bank details:\n',
            'Ulster Bank, Phibsborough, Dublin 7\n',
            'Account name: DX Fitout & Building Contractors Ltd\n',
            'Sort Code: 985047, AC: 12999808\n',
            'IBAN: IE75ULSB 985047 12999808 BIC: ULSBIE2D'
          ],
          bold: true,
          alignment: 'left',
          style: 'bank'
        }
      ],
      styles: {
        header: {
          fontSize: 24,
          bold: true
        },
        subheader: {
          fontSize: 16,
          bold: true
        },
        thanks: {
          fontSize: 18,
          bold: true
        },
        bank: {
          fontSize: 16,
          bold: true
        },
        photosHeader: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 10] // Adjust as needed for spacing
        }
      }
    };

    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

    pdfDocGenerator.getBlob(blob => {
      const filePath = `invoices/${invoice.invoiceNo}.pdf`;
      const storageRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.then(async () => {
        invoice.PDFUrl = await getDownloadURL(storageRef);
        await this.invoiceService.ChangeFieldtoInvoice(invoice.id, { PDF: true, PDFUrl: invoice.PDFUrl });
        if (invoice.jobId) {
          // Update the job's invoices list
      const jobDoc = doc(this.firestore, 'jobs', invoice.jobId);
      const jobSnapshot = await getDoc(jobDoc);
      if (jobSnapshot.exists()) {
          const jobData = jobSnapshot.data();
          const updatedInvoices = jobData['invoices'].map((inv: any) => {
              if (inv.id === invoice.id) {
                  return {
                      id: invoice.id,
                      url: invoice.PDFUrl,
                      amount: invoice.totalExclVAT,
                      sent: invoice.Sent,
                      paid: invoice.Paid,
                  };
              }
              return inv;
          });
          await updateDoc(jobDoc, { invoices: updatedInvoices, invoiced: invoice.type });
      }
      }
      });
    });
  }

  async removeInvoicePdf(invoice: Invoice): Promise<void> {
    const filePath = `invoices/${invoice.invoiceNo}.pdf`;
    const storageRef = ref(this.storage, filePath);
    await deleteObject(storageRef);
    const invoiceDocRef = doc(this.firestore, 'invoices', invoice.id);
    await updateDoc(invoiceDocRef, {
      PDF: false,
      PDFUrl: ''
    });
    if (invoice.jobId) {
      // Update the job's invoices list
  const jobDoc = doc(this.firestore, 'jobs', invoice.jobId);
  const jobSnapshot = await getDoc(jobDoc);
  if (jobSnapshot.exists()) {
      const jobData = jobSnapshot.data();
      const updatedInvoices = jobData['invoices'].map((inv: any) => {
          if (inv.id === invoice.id) {
              return {
                  id: invoice.id,
                  url: '',
                  amount: invoice.totalExclVAT,
                  sent: invoice.Sent,
                  paid: invoice.Paid,
              };
          }
          return inv;
      });
      await updateDoc(jobDoc, { invoices: updatedInvoices, invoiced: invoice.type });
  }
  }
  }

  async generateJobReportPdf(jobReport: JobReport) {
    const imageDataUrls = await Promise.all(jobReport.files.map(file => this.fetchImageAsDataUrl(file.fileURL)));
    const vatRate = 13.5; 
    const vatValue = jobReport.totalInclVAT - jobReport.totalExclVAT;

    const documentDefinition: TDocumentDefinitions = {
      content: [
        {
          columns: [
            [
              {
                image: dxLogo,
                width: 300
              },
            ],
            [
              { text: `Job Report`, style: 'header', alignment: 'center'},
              { text: `No: ${jobReport.jobReportNo}`, style: 'subheader', alignment: 'center' },
              { text: `Date: ${new Date((jobReport.date as any).seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, alignment: 'center' }
            ]
          ]
        },
        { text: 'DX Fit-Out & Building Contractors Ltd', style: 'subheader' },
        'D15 E036, Dublin, Ireland',
        'T: (01) 437 0947 / M: 087 190 9980',
        'E: info@dxcontractors.com / W: www.dxcontractors.com',
        {
          columns: [
            [
              { text: `To: ${jobReport.client.name}`, style: 'subheader' },
              { text: `Contact: ${jobReport.client.contact.contactName}` },
              { text: `Email: ${jobReport.client.contact.email}` },
              { text: `Phone: ${jobReport.client.contact.phone}` }
            ],
          ]
        },
        '\n',
        { text: `Order Number: ${jobReport.orderNumber}`, style: 'subheader' },
        { text: `Vendor Number: ${jobReport.vendorNumber}`, style: 'subheader' },
        '\n',
        {
          table: {
            widths: ['*', '15%', '15%', '20%'],
            body: [
              ['Item', 'Quantity', 'Price', 'Total'].map(header => {
                return { text: header, fillColor: '#FF6B1C', bold: true };
              }),
              ...jobReport.Items.map(item => {
                return [
                    {
                        text: [
                            { text: item.Item + '\n', bold: true }, 
                            item.description
                        ]
                    }, 
                    item.quantity, 
                    `€${item.price}`, 
                    `€${item.price * item.quantity}`
                ];
            }),
            
              ['', '', 'Subtotal:', `€${jobReport.totalExclVAT}`],
              ['', '', 'VAT @ 13.5%:', `€${vatValue}`],
              ['', '', 'TOTAL:', `€${jobReport.totalInclVAT}`]
            ]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1
          }
        },
        {
          ul: [
              "Our policy asks of our clients for an upfront payment of 30% within the first 3 days of starting a job, 30% half way through the job and 40% at the end(or remaining, if extras), payable within 21 days.",
              "A payment plan will be released upon deposit received and contract signed.",
              "Where a project exceeds 20,000EU in cost a scheduled payment plan will be produced.",
              "Different payment plans can also be accepted and agreed upon.",
              "Upon Completion 10% of total agreed cost to be withheld until all snags completed, if needed.",
              "This quote is an accurate measurement of labour & materials. Client may change materials, in contrast estimate may change also.",
              "DX Fit-out & Building Contractors Limited are fully insured and VAT Registered.",
              "Quotation valid for 21 days due to material cost increases.",
              "Floor installation of 3 years guaranteed if considerable lifting or coming apart of laminates by not proper installation, issues regarding installations and Tiles(wall+floor) fitted, water damage excluded.",
              "We offer a 3 Year Certificate of Guarantee on Mechanical/Electrical, along with a Manufacturers Guarantee.",
              "Cert to be provided for any electrical works",
              "Certificate of guarantee to be provided by principal contractor upon completion of works"
          ]
      },
      ...this.getPhotosSection(imageDataUrls),
        {
          text: '',
          pageBreak: 'after'
        },
        {
          image: dxLogo,
          width: 300,
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        {
          text: 'DX Fit-Out & Building Contractors Ltd',
          style: 'subheader',
          alignment: 'center',
          bold: true,
          margin: [0, 0, 0, 20]
        },
        {
          text: [
            'D15 E036, Dublin, Ireland\n',
            'T: (01) 437 0947 / M: 087 190 9980\n',
            'E: info@dxcontractors.com / W: www.dxcontractors.com\n',

          ],
          alignment: 'center',
          bold: true,
          margin: [0, 0, 0, 20]
        },
        {
          text: 'Thank you for your business.',
          style: 'thanks',
          margin: [0, 50, 0, 50]
        },
        {
          text: [
            'Our bank details:\n',
            'Ulster Bank, Phibsborough, Dublin 7\n',
            'Account name: DX Fitout & Building Contractors Ltd\n',
            'Sort Code: 985047, AC: 12999808\n',
            'IBAN: IE75ULSB 985047 12999808 BIC: ULSBIE2D'
          ],
          bold: true,
          alignment: 'left',
          style: 'bank'
        }
      ],
      styles: {
        header: {
          fontSize: 24,
          bold: true
        },
        subheader: {
          fontSize: 16,
          bold: true
        },
        thanks: {
          fontSize: 18,
          bold: true
        },
        bank: {
          fontSize: 16,
          bold: true
        },
        photosHeader: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 10] // Adjust as needed for spacing
        }
      }
    };

    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

    pdfDocGenerator.getBlob(blob => {
      const filePath = `jobReports/${jobReport.jobReportNo}.pdf`;
      const storageRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.then(async () => {
        jobReport.PDFUrl = await getDownloadURL(storageRef);
        await this.jobReportService.ChangeFieldtoJobReport(jobReport.id, { PDF: true, PDFUrl: jobReport.PDFUrl });
        if (jobReport.jobId) {
          // Update the job's jobReports list
      const jobDoc = doc(this.firestore, 'jobs', jobReport.jobId);
      const jobSnapshot = await getDoc(jobDoc);
      if (jobSnapshot.exists()) {
          const jobData = jobSnapshot.data();
          const updatedJobReports = jobData['jobReports'].map((inv: any) => {
              if (inv.id === jobReport.id) {
                  return {
                      id: jobReport.id,
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
      });
    });
  }

  async removeJobReportPdf(jobReport: JobReport): Promise<void> {
    const filePath = `jobReports/${jobReport.jobReportNo}.pdf`;
    const storageRef = ref(this.storage, filePath);
    await deleteObject(storageRef);
    const jobReportDocRef = doc(this.firestore, 'jobReports', jobReport.id);
    await updateDoc(jobReportDocRef, {
      PDF: false,
      PDFUrl: ''
    });
    if (jobReport.jobId) {
      // Update the job's jobReports list
  const jobDoc = doc(this.firestore, 'jobs', jobReport.jobId);
  const jobSnapshot = await getDoc(jobDoc);
  if (jobSnapshot.exists()) {
      const jobData = jobSnapshot.data();
      const updatedJobReports = jobData['jobReports'].map((inv: any) => {
          if (inv.id === jobReport.id) {
              return {
                  id: jobReport.id,
                  url: '',
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


  
  async fetchImageAsDataUrl(url: string): Promise<string> {
    const blob = await this.http.get(url, { responseType: 'blob' }).toPromise();
    
    if (!blob) {
        throw new Error('Failed to fetch the image or image is undefined.');
    }

    return this.convertBlobToDataUrl(blob);
}

  convertBlobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  generateImageRows(imageUrls: string[]): any[] {
    const rows = [];
    for (let i = 0; i < imageUrls.length; i += 4) {
      const row = [];
      for (let j = 0; j < 3; j++) {
        if (imageUrls[i + j]) {
          row.push({
            image: imageUrls[i + j],
            width: 170, // Adjust width as needed
            margin: [j === 0 ? 0 : 5, 5, j === 2 ? 0 : 5, 5] // Adjust space between images
          });
        } else {
          row.push({});
        }
      }
      rows.push(row);
    }
    return rows;
}

getPhotosSection(imageDataUrls: string[]): any {
  if (imageDataUrls.length === 0) {
      return [];
  }

  return [
      {
          text: '',
          pageBreak: 'after'
      },
      {
          stack: [
              {
                  text: 'Photos',
                  style: 'photosHeader',
                  margin: [0, 0, 0, 10] // Adjust as needed for spacing below the title
              },
              {
                  table: {
                      widths: ['*'],
                      body: [
                          [
                              {
                                  stack: this.generateImageRows(imageDataUrls).map(row => {
                                      return {
                                          columns: row
                                      };
                                  }),
                                  border: [true, true, true, true], // This will add border to the cell
                                  margin: [5, 5, 5, 5] // Margin to ensure images are inside the border
                              }
                          ]
                      ]
                  },
                  layout: {
                      hLineWidth: () => 1,
                      vLineWidth: () => 1,
                      hLineColor: () => 'black',
                      vLineColor: () => 'black'
                  }
              }
          ]
      }
  ];
}


}
