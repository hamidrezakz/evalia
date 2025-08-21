// اسکریپت تبدیل school_tables_empty.json به اکسل با ساختار فقط ستون‌ها
const ExcelJS = require("exceljs");
const fs = require("fs");

async function jsonToExcelEmpty() {
  const data = JSON.parse(
    fs.readFileSync("./school_tables_empty.json", "utf8")
  );
  const workbook = new ExcelJS.Workbook();

  // شیت‌های ارزیابی
  data.assessments.forEach((a) => {
    const ws = workbook.addWorksheet(a.type);
    ws.addRow(Object.keys(a.data));
  });

  await workbook.xlsx.writeFile("./school_tables_empty.xlsx");
  console.log("school_tables_empty.xlsx ساخته شد.");
}

jsonToExcelEmpty();
