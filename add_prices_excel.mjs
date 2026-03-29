import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRICE_MAP = {
  // Suspensión y Dirección
  'amortiguador': 45.00,
  'meseta': 60.00,
  'buje': 15.00,
  'muñon': 20.00,
  'terminal': 15.00,
  'rotula': 25.00,
  'lapiz': 15.00,
  'estabilizador': 20.00,
  'goma': 10.00,
  'hueso': 20.00,
  'base': 25.00,
  // Frenos
  'pastilla': 30.00,
  'freno': 25.00,
  'disco': 40.00,
  'banda': 30.00,
  'tambor': 45.00,
  // Transmisión
  'rolinera': 35.00,
  'mozo': 45.00,
  'cubo': 50.00,
  'tripode': 35.00,
  'trizeta': 25.00,
  // Motor
  'soporte': 30.00,
  'filtro': 10.00,
  'bomba': 45.00,
  'correa': 20.00,
  'estopera': 8.00,
  // Eléctrico
  'bujia': 6.00,
  'bobina': 25.00,
  'cable': 18.00,
  'sensor': 25.00
};

function assignEstimatedPrice(name) {
  const lowerName = name.toLowerCase();
  for (const [key, price] of Object.entries(PRICE_MAP)) {
    if (lowerName.includes(key)) {
      return price;
    }
  }
  return 20.00; // Precio base general
}

async function processExcel() {
  const filePath = path.join(__dirname, 'public', 'banco_imagenes_procesado.xlsx');
  
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  const sheet = workbook.getWorksheet('Plantilla Repuestos');
  if (!sheet) {
    console.error("No se encontró la hoja 'Plantilla Repuestos'");
    return;
  }
  
  let rowsUpdated = 0;
  
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Header
    
    const nameCell = row.getCell('A').value || '';
    const currentPrice = row.getCell('B').value;
    
    if (nameCell.toString().trim() !== '' && (currentPrice === 0 || currentPrice === '0' || !currentPrice)) {
      const estimatedPrice = assignEstimatedPrice(nameCell.toString());
      row.getCell('B').value = estimatedPrice;
      rowsUpdated++;
    }
  });
  
  await workbook.xlsx.writeFile(filePath);
  
  console.log(`✅ Excel de importación completado.`);
  console.log(`Se insertaron precios aproximados a ${rowsUpdated} repuestos que valían $0.`);
  console.log(`Puedes importar sin fallos desde public/banco_imagenes_procesado.xlsx`);
}

processExcel().catch(console.error);
