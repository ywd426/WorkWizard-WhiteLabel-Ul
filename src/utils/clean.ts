// 实现download方法，根据type下载文件：PDF / excel
export function download(data: any, type = 'pdf', name = 'file') {
    // 定义文件类型配置
    const fileConfig = {
      pdf: {
        mimeType: 'application/pdf',
        fileName: `${name}.pdf`
      },
      excel: {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileName: `${name}.xlsx`
      }
    };
  
    // 检查支持的文件类型
    if (!fileConfig[type]) {
      console.error(`Unsupported file type: ${type}`);
      return;
    }
  
    const { mimeType, fileName } = fileConfig[type];
    const a = document.createElement('a');
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
  
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

export const initTimePickerDate = (date: string) => { 
    // 'HH:mm:ss' to new Date with current date and provided time
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    return new Date(year, month, day, ...date.split(':').map(Number));
}

export const initDatePickerDate = (date: string) => {
    // '2025-06-02 08:00:00'格式解析为年、月、日、时、分、秒
    //  format="YYYY-MM-DD"
    const [datePart, timePart] = date.split(' ');
    if (!datePart || !timePart) {
        throw new Error('Invalid date format, expected format is "YYYY-MM-DD HH:MM:SS"');
    }
    
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    
    // 月份需要减1，因为JavaScript Date对象的月份是从0开始的
    return new Date(year, month - 1, day, hours, minutes, seconds).toISOString().split('T');
}

export const revertTime = (time) => {
  const date = new Date(time);
  return date.toTimeString().split(' ')[0]; // 提取 "08:18:03"
};