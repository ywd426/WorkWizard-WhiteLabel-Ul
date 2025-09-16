export interface FaultForm {
  id: string;
  createTime: string;
  equipmentName: string;
  name: string;
  assignee: string;
  reporter: string;
  severity: string;
  severityName?: string;
  location: string;
  tags: string;
  status: string;
  statusName?: string;
}
export interface FaultQuery extends PageQuery {
  name?: string;
  equipmentId?: string;
  equipmentName?: string;
  ruleName?: string;
  assignee?: string;
  reporter?: string;
  severity?: string;
  status?: string;
  search?: string;
  orderByColumn: string;
  isAsc: string;
}
export interface SensorForm {
  sensorId: string;
  sensorName: string;
  dataType: string;
  rangeStart: string;
  rangeEnd: string;
  unit: string;
  frequency: number;
  duration: number;
  durationUnit: string;
  tags: string;
  dataTypes?: any[];
}
export interface MetricsForm {
  sensorName: string;
  rangeStart: string;
  rangeEnd: string;
  unit: string;
  frequency: number;
  duration: number;
  tags: string;
}
export interface ExternalFactors {
  key: string;
  value: string;
}
export interface FailureCosts {
  key: string;
  value: number;
}
export interface ReportForm {
  id: string;
  creationDate: string;
  equipmentId: string;
  equipmentName: string;
  equipmentAge: string;
  maintenanceHistory: string;
  operationState: string | string[];
  affectedAreas: string;
  precedingEvents: string;
  externalFactorList: ExternalFactors[];
  name: string;
  startTimestamp: string;
  endTimestamp: string;
  type: string;
  assignee: string;
  reporter: string;
  severity: string;
  status: string;
  expectedResolutionTime: number;
  failureCostList: FailureCosts[];
  pastSimilarFaults: string;
  diagnosisAttempts: string;
  potentialReasons: string;
  remind: boolean;
  observable: boolean;
  ruleId?: string;
  ruleName?: string;
  sensorDetail?: SensorForm[];
  metricsDetail?: MetricsForm[];
  attachment?: string;
  attachmentList?: any[];
  description?: string;
  comments?: string;
  timeUnit: string;
  reportType?: string;
}
