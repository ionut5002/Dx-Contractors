export interface Invoice {
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
    invoiceNo: string;
    date: Date;
    orderNumber: string;
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
    Paid: boolean;
    PDFUrl: string;
    type: string;
    CreatedBy: string;
    CreatedDate: Date;
}