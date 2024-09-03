import { ServiceRequest } from './../service-requests/service-requests.model';
export interface User {
  _id?: string;
  preferredName: string;
  email: string;
  phone: string;
  address: string;
  socialMediaHandles: string[];
  role: string;
  active: boolean;
  services: ServiceRequest[];
  subscription: string;
}
