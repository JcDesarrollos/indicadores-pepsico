export interface SecurityMetrics {
  totalZones: number;
  totalSites: number;
  totalPosts: number;
  totalPersonnel: number;
}

export interface GenderDistribution {
  name: string;
  value: number;
  color: string;
}

export interface RoleDistribution {
  role: string;
  count: number;
}

export interface ModalityDistribution {
  modality: string;
  count: number;
}

export interface SiteDetail {
  idSede: number;
  zona: string;
  site: string;
  puestos: number;
  personas: number;
  mujeres: number;
  hombres: number;
}

export interface DashboardData {
  metrics: SecurityMetrics;
  genderData: GenderDistribution[];
  roleData: RoleDistribution[];
  modalityData: ModalityDistribution[];
  sitesDetail: SiteDetail[];
  visitasStats: {
    planeadas: number;
    ejecutadas: number;
    mensual: { mes_num: number, planeadas: number, ejecutadas: number }[];
  };
  rotationStats?: {
    total: number;
    byType: { name: string, value: number }[];
  }
}
