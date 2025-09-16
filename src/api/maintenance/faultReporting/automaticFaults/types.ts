export interface RuleForm {
  id: string;
  createTime: string;
  name: string;
  effectiveDateStart: string;
  effectiveDateEnd: string;
  equipmentName: string;
  location: string;
  ruleType: string;
  tags: string;
  status: boolean;
}
export interface RuleQuery extends PageQuery {
  name: string;
  equipmentId?: string;
  equipmentName?: string;
  ruleType?: string;
  search?: string;
  orderByColumn: string;
  isAsc: string;
}
