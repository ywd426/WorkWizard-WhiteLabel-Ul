export const errorCode: any = {
  '401': 'Authentication Failed, Unable To Access System Resources.', // 认证失败，无法访问系统资源
  '403': 'The Current Operation Does Not Have Permission.', // 当前操作没有权限
  '404': 'Access Resource Does Not Exist.', // 访问资源不存在
  default: 'Unknown System Error, Please Provide Feedback To The Administrator.' // 系统未知错误，请反馈给管理员
};
export default errorCode;
