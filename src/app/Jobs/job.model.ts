export interface Job {
    location: string;
    description: string;
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
    startDate: Date;
    endDate: Date;
    materials: Array<{
        material: string;
        quantity: number;
        price: number;
    }>;
    labour: {
        men: number;
        rate: number;
        total: number
    };
    logistics: string;
    mecanicalelectrical: string;
    quotationId?: string;
    quotationNo: string;
    id: string;
    invoiced: string;
    invoices: Array<{id: string, url: string, amount: number, sent: boolean, paid: boolean}>;
    jobValue: number;
    orderNumber:  string;
    vendorNumber: string;
    jobReports: Array<{id: string, url: string, amount: number}>;
    CreatedBy: string;
    CreatedDate: Date;
    files:  Array<{
        fileName: string;
        fileURL: string
      }>

}
