import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORY_MAP = {
  // Suspensión y Dirección
  'amortiguador': 'Suspensión y Dirección',
  'meseta': 'Suspensión y Dirección',
  'buje': 'Suspensión y Dirección',
  'muñon': 'Suspensión y Dirección',
  'terminal': 'Suspensión y Dirección',
  'rotula': 'Suspensión y Dirección',
  'lapiz': 'Suspensión y Dirección',
  'estabilizador': 'Suspensión y Dirección',
  'goma': 'Suspensión y Dirección',
  'hueso': 'Suspensión y Dirección',
  'base': 'Suspensión y Dirección',
  // Frenos
  'pastilla': 'Frenos',
  'freno': 'Frenos',
  'disco': 'Frenos',
  'banda': 'Frenos',
  'tambor': 'Frenos',
  // Transmisión
  'rolinera': 'Rodamientos y Ruedas',
  'mozo': 'Rodamientos y Ruedas',
  'cubo': 'Rodamientos y Ruedas',
  'tripode': 'Transmisión',
  'trizeta': 'Transmisión',
  // Motor
  'soporte': 'Motor',
  'filtro': 'Motor',
  'bomba': 'Motor',
  'correa': 'Motor',
  'estopera': 'Motor',
  // Eléctrico
  'bujia': 'Eléctrico',
  'bobina': 'Eléctrico',
  'cable': 'Eléctrico',
  'sensor': 'Eléctrico'
};

function assignCategory(name) {
  const lowerName = name.toLowerCase();
  for (const [key, category] of Object.entries(CATEGORY_MAP)) {
    if (lowerName.includes(key)) {
      return category;
    }
  }
  return 'General';
}

function generateDescription(name, brand) {
  return `Repuesto genuino diseñado para ofrecer el máximo rendimiento y durabilidad. ${name}. Fabricado bajo los más altos estándares de calidad de ${brand || 'la marca'}.`;
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
    const brandCell = row.getCell('D').value || 'Generica';
    
    if (nameCell.toString().trim() !== '') {
      const newCategory = assignCategory(nameCell.toString());
      const newDescription = generateDescription(nameCell.toString(), brandCell.toString());
      
      row.getCell('C').value = newCategory; // Categoría
      row.getCell('E').value = newDescription; // Descripción
      rowsUpdated++;
    }
  });
  
  const outputPath = path.join(__dirname, 'public', 'banco_imagenes_procesado_mejorado.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  
  console.log(`✅ Excel procesado correctamente.`);
  console.log(`Se actualizaron ${rowsUpdated} filas con sus nuevas categorías y descripciones.`);
  console.log(`Guardado en: public/banco_imagenes_procesado_mejorado.xlsx`);
}

processExcel().catch(console.error);
