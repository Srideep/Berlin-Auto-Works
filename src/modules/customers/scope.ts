/** Customer and staff queries include these ids. They are never implied. */
export interface CustomerScope {
  customerId: string;
  locationId: string;
}

export interface StaffScope {
  staffId: string;
  locationId: string;
  role: "service_advisor" | "technician" | "manager";
}
