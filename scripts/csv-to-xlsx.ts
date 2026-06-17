import * as fs from 'fs';
import ExcelJS from 'exceljs';

const INPUT_CSV = './sppt-2025-merged.csv';
const OUTPUT_XLSX = './sppt-2025-merged.xlsx';

async function convertToExcel() {
  console.log('📖 Reading CSV file...');

  // Read CSV file
  const csvContent = fs.readFileSync(INPUT_CSV, 'utf8');

  // Parse CSV
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    console.log('⚠️ No data found');
    return;
  }

  // Parse headers
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').replace(/""/g, '"'));

  // Parse data rows
  const data = lines.slice(1).map(line => {
    const values: string[] = [];
    let inQuotes = false;
    let currentValue = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentValue += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.replace(/^"|"$/g, '').replace(/""/g, '"'));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.replace(/^"|"$/g, '').replace(/""/g, '"'));
    return values;
  });

  console.log(`✅ Read ${data.length} rows`);

  console.log('📝 Creating Excel file...');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('SPPT 2025');

  // Add headers
  worksheet.columns = headers.map(h => ({ header: h, key: h }));

  // Add data
  worksheet.addRows(data.map((row, idx) => {
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] || '';
    });
    return obj;
  }));

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 20;

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    if (column.eachCell) {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const cellValue = cell.value ? String(cell.value).length : 10;
        if (cellValue > maxLength) {
          maxLength = cellValue;
        }
      });
      column.width = maxLength < 15 ? 15 : maxLength + 2;
    }
  });

  // Freeze header row
  worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 1 }
  ];

  // Add some styling for data rows
  const rowCount = data.length + 1;
  for (let i = 2; i <= Math.min(rowCount, 10002); i++) {
    const row = worksheet.getRow(i);
    // Alternating row colors for first 1000 rows
    if (i <= 1002) {
      row.fill = i % 2 === 0
        ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F9F9' } }
        : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    }
  }

  console.log('💾 Saving Excel file...');
  await workbook.xlsx.writeFile(OUTPUT_XLSX);
  console.log(`✅ Saved to: ${OUTPUT_XLSX}`);

  // Get file size
  const stats = fs.statSync(OUTPUT_XLSX);
  console.log(`📊 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

convertToExcel().catch(console.error);
