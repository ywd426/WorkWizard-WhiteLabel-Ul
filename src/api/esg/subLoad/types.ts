/**
 * Sub Load 通用查询参数
 */
export interface SubLoadQuery {
  building?: string;
  pickDate?: string;
  modeType?: string;
  forecastDate?: string;
  nodeId?: string;
}

/**
 * Sub Load 节点信息
 */
export interface SubLoadTreeInfo {
  id?: number;
  upId?: number;
  level?: number;
  name?: string;
  load?: number;
  remark?: string;
  symbol?: string;
  collapsed?: boolean;
  lineStyle?: SubLoadTreeLineStyle;
  children?: SubLoadTreeInfo[];
}

/**
 * Sub Load 节点连接线信息
 */
export interface SubLoadTreeLineStyle {
  color?: string;
}
