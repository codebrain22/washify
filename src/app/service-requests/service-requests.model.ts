export interface ServiceRequest {
  _id?: string;
  serviceType: string;
  pickupTime: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  requestedOn: string;
  returnedOn?: string;
  reference: string;
  owner: string;
  onceOff?: string;
}
