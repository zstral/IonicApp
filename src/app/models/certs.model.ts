export interface Certs {
    id?: number;
    name: string;
    acquiredDate: Date | string | null;
    expirationDate?: Date | string | null;
}