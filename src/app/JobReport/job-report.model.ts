export interface JobReport {
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
    jobReportNo: string;
    date: Date;
    orderNumber:  string;
    vendorNumber: string;
    Items: Array<{
        Item: string;
        description: string;
        quantity: number;
        price: number;
    }>;
    totalExclVAT: number;
    totalInclVAT: number;
    jobId?: string;
    PDF: boolean;
    Sent: boolean;
    PDFUrl: string;
    type: string;
}