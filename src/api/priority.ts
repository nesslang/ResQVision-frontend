import { apiRequest } from "./client";

export interface PriorityHabitation {
  id: string;
  name: string;
  district: string;

  priority_score: number;
  relocation_category:
    | "IMMEDIATE"
    | "SHORT_TERM"
    | "MEDIUM_TERM";

  population: number;
  risk_score: number;

  vulnerability_score?: number;

  elderly?: number;
  children?: number;
  disabled?: number;

  housing_condition?: number;
  poverty_indicator?: number;
  emergency_accessibility?: number;
}

export interface PriorityListResponse {
  items: PriorityHabitation[];
  total?: number;
}

export async function getPriorityList() {
  return apiRequest<PriorityListResponse>(
    "/priority/",
  );
}

export async function getPriorityHabitation(
  id: string,
) {
  return apiRequest<PriorityHabitation>(
    `/priority/${id}`,
  );
}

export async function getPriorityGeoJSON() {
  return apiRequest<GeoJSON.GeoJSON>(
    "/priority/geojson/ranking",
  );
}