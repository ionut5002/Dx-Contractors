export interface Client {
    id?: string;
    name: string;
    type: 'Commercial' | 'Private';
    contacts: Array<{
        deptName: string;
        contactName: string;
        email: string;
        phone: string;
    }>;
}