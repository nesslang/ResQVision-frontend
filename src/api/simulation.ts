import { apiRequest } from "./client";

export interface SimulationAllocation {
  site_id: string;
  population: number;
}

export interface SimulationRequest {
  habitation_id: string;
  population_to_relocate: number;
  allocations: SimulationAllocation[];
}

export interface SimulationResult {
  success: boolean;

  total_population_relocated: number;

  allocations: SimulationAllocation[];

  remaining_capacity?: number;

  warnings?: string[];

  before?: {
    population: number;
    risk_score: number;
  };

  after?: {
    population: number;
    risk_score: number;
  };
}

export async function runRelocationSimulation(
  data: SimulationRequest,
) {
  return apiRequest<SimulationResult>(
    "/simulation/run",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}