export interface Certs {
    id?: number;
    name: string;
    acquiredDate: Date | null;
    expirationDate?: Date | null;
}