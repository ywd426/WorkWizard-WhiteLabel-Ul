export interface NotificationsForm {
  id: string;
  createTime: string;
  content: string;
  notificationType: string;
  relationType: string;
  relationId: string;
  status: string;
}
export interface NotificationsQuery extends PageQuery {
  name: string;
  notificationType?: string;
  type?: string;
  search?: string;
  hasHidden: boolean;
  orderByColumn: string;
  isAsc: string;
}
