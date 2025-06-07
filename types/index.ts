export interface Client {
  id?: string;
  name: string;
  inn: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export interface Trip {
  id?: string;
  date: string;
  clientId: string;
  startLocation: string;
  endLocation: string;
  cargo: string;
  driver: string;
  vehicle: string;
  status: string;
  income: number;
  expenses: number;
  notes: string;
}

export interface TripHistory {
  id?: string;
  tripId: string;
  changeDate: string;
  changedFields: string;
  previousValues: string;
  newValues: string;
}

export interface Document {
  id?: string;
  tripId: string;
  name: string;
  type: string;
  uri: string;
  uploadDate: string;
  notes: string;
}

export interface AppSchema {
  clients: {
    [id: string]: Client;
  };
  trips: {
    [id: string]: Trip;
  };
  tripHistory: {
    [id: string]: TripHistory;
  };
  documents: {
    [id: string]: Document;
  };
}

export type TripStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled';

export type DocumentType = 'invoice' | 'waybill' | 'contract' | 'other';

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  clientId?: string;
  startLocation?: string;
  endLocation?: string;
  status?: TripStatus;
}