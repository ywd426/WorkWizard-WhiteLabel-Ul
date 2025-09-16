/**
 * 通用搜索条件
 */
export interface EsgLightingQuery {
  id: string;
  status?: string;
}
/**
 * 灯光楼层统合信息
 */
export interface EsgLightingFloorInfo {
  id: number;
  floorId: string;
  status: string;
  minPercentage: number;
  maxPercentage: number;
  deduction: number;
  origin: number;
  currentLoad: number;
  maxLoad: number;
  percentage: number;
}
