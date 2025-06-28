export interface Experience {
  id?: number;
  company: string;
  startYear: number | null; 
  currentJob: boolean;
  endYear?: number | null;
  jobPosition: string;
}