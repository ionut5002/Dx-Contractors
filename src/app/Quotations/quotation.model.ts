export interface Quotation {
    id: string;
    client: {
        name: string;
        type: string;
        contact: {
            deptName: string;
            contactName: string;
            email: string;
            phone: string;
        }
    };
    location: string;
    quotationNo: string;
    date: Date;
    descriptions: Array<{
        title: string;
        text: string;
    }>;
    materials: Array<{
        material: string;
        quantity: number;
        price: number;
    }>;
    totalExclVAT: number;
    totalInclVAT: number;
    jobId?: string;
    PDF: boolean;
    Sent: boolean;
    PDFUrl: string;
    CreatedBy: string;
    CreatedDate: Date;
    files:  Array<{
        fileName: string;
        fileURL: string
      }>
}
