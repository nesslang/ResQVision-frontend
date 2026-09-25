import { apiRequest } from "./client";

export interface RelocationSite {
  id: number;
  site_id: number;

  name: string;
  district: string;

  latitude: number;
  longitude: number;

  capacity: number;
  current_population: number;
  available_capacity: number;

  suitability_score: number;

  safety_score: number;
  infrastructure_score: number;
  land_score: number;
  accessibility_score: number;
  water_score: number;
  healthcare_score: number;
}

export interface SitesResponse {
  success: boolean;
  data: {
    items: RelocationSite[];
    total: number;
    limit: number;
    offset: number;
  };
}

export async function getSites(
  params?: {
    suitable_only?: boolean;
    district?: string;
    min_score?: number;
    limit?: number;
    offset?: number;
  },
) {
  const searchParams = new URLSearchParams();

  if (params?.suitable_only !== undefined) {
    searchParams.set(
      "suitable_only",
      String(params.suitable_only),
    );
  }

  if (params?.district) {
    searchParams.set("district", params.district);
  }

  if (params?.min_score !== undefined) {
    searchParams.set(
      "min_score",
      String(params.min_score),
    );
  }

  if (params?.limit !== undefined) {
    searchParams.set(
      "limit",
      String(params.limit),
    );
  }

  if (params?.offset !== undefined) {
    searchParams.set(
      "offset",
      String(params.offset),
    );
  }

  const query = searchParams.toString();

  return apiRequest<SitesResponse>(
    `/sites/${query ? `?${query}` : ""}`,
  );
}

export async function getSite(id: number) {
  return apiRequest<{
    success: boolean;
    data: RelocationSite;
  }>(`/sites/${id}`);
}

export async function getSitesGeoJSON() {
  return apiRequest<GeoJSON.GeoJSON>(
    "/sites/geojson/all",
  );
}