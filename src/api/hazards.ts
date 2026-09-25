import { apiRequest } from "./client";

export interface Hazard {
  id: string;
  name: string;
  district: string;
  risk_score: number;
  risk_category: "SAFE" | "WARNING" | "RED";

  rainfall?: number;
  elevation?: number;
  slope?: number;
  distance_from_river?: number;
  distance_from_coast?: number;

  soil?: string;
  geology?: string;
  land_use?: string;

  historical_disasters?: number;
}

export interface HazardListResponse {
  items: Hazard[];
  total?: number;
}

export async function getHazards() {
  return apiRequest<HazardListResponse>(
    "/hazards/",
  );
}

export async function getHazard(id: string) {
  return apiRequest<Hazard>(
    `/hazards/${id}`,
  );
}

export async function getHazardZonesGeoJSON() {
  return apiRequest<GeoJSON.GeoJSON>(
    "/hazards/geojson/zones",
  );
}