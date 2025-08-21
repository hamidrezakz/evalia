// اسکریپت تبدیل school_tables.json به اکسل با استفاده از exceljs
const ExcelJS = require("exceljs");
const fs = require("fs");

async function jsonToExcel() {
  const data = JSON.parse(fs.readFileSync("./school_tables.json", "utf8"));
  const workbook = new ExcelJS.Workbook();

  // شیت دانش‌آموزان
  const wsStudents = workbook.addWorksheet("دانش‌آموزان");
  wsStudents.addRow(["کدملی", "نام", "نام خانوادگی", "سن"]);
  data.students.forEach((s) => {
    wsStudents.addRow([s.id, s.firstName, s.lastName, s.age]);
  });

  // شیت معلم‌ها
  const wsTeachers = workbook.addWorksheet("معلم‌ها");
  wsTeachers.addRow(["کد", "نام معلم"]);
  data.teachers.forEach((t) => {
    wsTeachers.addRow([t.id, t.name]);
  });

  // شیت‌های ارزیابی برای هر نوع
  const types = [...new Set(data.assessments.map((a) => a.type))];
  types.forEach((type) => {
    const ws = workbook.addWorksheet(type);
    // پیدا کردن همه معیارهای این نوع ارزیابی
    const allCriteria = Array.from(
      new Set(
        data.assessments
          .filter((a) => a.type === type)
          .flatMap((a) => Object.keys(a.data))
      )
    );
    ws.addRow([
      "کدملی",
      "نام",
      "نام خانوادگی",
      "نام دبیر ارزیابی",
      ...allCriteria,
    ]);
    data.assessments
      .filter((a) => a.type === type)
      .forEach((a) => {
        const student = data.students.find((s) => s.id === a.studentId) || {};
        const teacher = data.teachers.find((t) => t.id === a.teacherId) || {};
        ws.addRow([
          a.studentId,
          student.firstName || "",
          student.lastName || "",
          teacher.name || "",
          ...allCriteria.map((c) => a.data[c] || ""),
        ]);
      });
  });

  await workbook.xlsx.writeFile("./school_tables.xlsx");
  console.log("school_tables.xlsx ساخته شد.");
}

jsonToExcel();
