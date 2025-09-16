export interface RuleForm {
  id: string;
  createTime: string;
  name: string;
  effectiveDateStart: string;
  effectiveDateEnd: string;
  equipmentName: string;
  location: string;
  category: string;
  triggerNum: number;
  generateNum: number;
  status: boolean;
}
export interface RuleQuery extends PageQuery {
  name: string;
  equipmentId?: string;
  equipmentName?: string;
  category?: string;
  search?: string;
  orderByColumn: string;
  isAsc: string;
}
