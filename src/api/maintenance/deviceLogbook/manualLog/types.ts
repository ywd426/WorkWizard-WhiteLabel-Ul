export interface LogForm {
  id: string;
  createTime: string;
  equipmentName: string;
  category: string;
  name: string;
  environment: string;
  keyEvent: string;
  location: string;
  tags: string;
}
export interface LogQuery extends PageQuery {
  name?: string;
  equipmentId?: string;
  equipmentName?: string;
  ruleName?: string;
  category?: string;
  tags?: string;
  search?: string;
  orderByColumn: string;
  isAsc: string;
}
