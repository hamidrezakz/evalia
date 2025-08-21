// اسکریپت تبدیل school_tables_empty.json به اکسل با ساختار فقط ستون‌ها و ستون‌های دانش‌آموز و معلم
const ExcelJS = require("exceljs");
const fs = require("fs");

async function jsonToExcelEmpty() {
  const data = JSON.parse(
    fs.readFileSync("./empty/bamdadsharghi_empty_template.json", "utf8")
  );
  const workbook = new ExcelJS.Workbook();

  // شیت دانش‌آموزان
  const wsStudents = workbook.addWorksheet("دانش‌آموزان");
  wsStudents.addRow(["نام", "نام خانوادگی", "مقطع", "سن"]);

  // شیت معلم‌ها
  const wsTeachers = workbook.addWorksheet("معلم‌ها");
  wsTeachers.addRow(["نام", "نام خانوادگی", "نقش"]);

  // شیت‌های ارزیابی
  data.assessments.forEach((a) => {
    const ws = workbook.addWorksheet(a.type);
    ws.addRow(Object.keys(a.data));
  });

  await workbook.xlsx.writeFile("./empty/bamdadsharghi_empty_template.xlsx");
  console.log("bamdadsharghi_empty_template.xlsx ساخته شد.");
}

jsonToExcelEmpty();
