import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import ExcelJS from 'exceljs';
import sharp from 'sharp';

const CATEGORY_MAP = {
  'amortiguador': 'Suspensión y Dirección', 'meseta': 'Suspensión y Dirección', 'buje': 'Suspensión y Dirección',
  'muñon': 'Suspensión y Dirección', 'terminal': 'Suspensión y Dirección', 'rotula': 'Suspensión y Dirección',
  'lapiz': 'Suspensión y Dirección', 'estabilizador': 'Suspensión y Dirección', 'goma': 'Suspensión y Dirección',
  'hueso': 'Suspensión y Dirección', 'base': 'Suspensión y Dirección', 'pastilla': 'Frenos', 'freno': 'Frenos',
  'disco': 'Frenos', 'banda': 'Frenos', 'tambor': 'Frenos', 'rolinera': 'Rodamientos y Ruedas',
  'mozo': 'Rodamientos y Ruedas', 'cubo': 'Rodamientos y Ruedas', 'tripode': 'Transmisión', 'trizeta': 'Transmisión',
  'soporte': 'Motor', 'filtro': 'Motor', 'bomba': 'Motor', 'correa': 'Motor', 'estopera': 'Motor',
  'bujia': 'Eléctrico', 'bobina': 'Eléctrico', 'cable': 'Eléctrico', 'sensor': 'Eléctrico'
};

function assignCategory(name) {
  const lower = name.toLowerCase();
  for (const [key, category] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return category;
  }
  return 'General';
}

function generateDescription(name, brand) {
  return `Repuesto genuino diseñado para ofrecer el máximo rendimiento y durabilidad. ${name}. Fabricado bajo los más altos estándares de calidad de ${brand || 'la marca'}.`;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local o .env");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("\n❌ Error: Debes proporcionar tu email y contraseña de administrador para saltar las políticas RLS de subida de imágenes.");
  console.error("💡 Uso correcto: node --env-file=.env.local seeder_excel.mjs <tu_email> <tu_contraseña>\n");
  process.exit(1);
}

const BASE_DIR = path.join(process.cwd(), 'public', 'Banco Imagenes App', 'Banco Imagenes App');

// Función helper para crear un delay y no saturar la API
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function uploadImage(filePath, folderName, fileName) {
  const destPath = `import/${folderName.replace(/[^a-zA-Z0-9]/g, '_')}_${fileName.replace(/\.[^/.]+$/, "")}.webp`;
  
  try {
    const fileBuffer = await fs.readFile(filePath);
    const compressedBuffer = await sharp(fileBuffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 65 })
      .toBuffer();

    const { data, error } = await supabase.storage
      .from('products')
      .upload(destPath, compressedBuffer, { contentType: 'image/webp' });

    if (error) {
       // Si el error es porque ya existe, igual generamos la URL pública
       if (error.statusCode === '409' || error.message.includes('already exists') || error.message.includes('Duplicate')) {
          const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(destPath);
          return publicUrl;
       }
       console.error(`Error subiendo ${fileName}:`, error.message);
       return null;
    }
    
    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(destPath);
    return publicUrl;
  } catch (err) {
    console.error(`Error leyendo ${filePath}:`, err.message);
    return null;
  }
}

async function run() {
  console.log("Iniciando sesión como administrador para Storage...");
  const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
  if (authErr) {
    console.error("❌ Error iniciando sesión:", authErr.message);
    process.exit(1);
  }
  console.log("✅ Sesión iniciada correctamente.");

  if (!existsSync(BASE_DIR)) {
    console.error("El directorio base no existe:", BASE_DIR);
    process.exit(1);
  }

  const marcasDirs = await fs.readdir(BASE_DIR, { withFileTypes: true });
  
  let successCount = 0;
  let rowsData = [];

  for (const marcaDir of marcasDirs) {
    if (!marcaDir.isDirectory()) continue;
    const marcaName = marcaDir.name;
    console.log(`\n============================`);
    console.log(`📦 Procesando Marca: ${marcaName}`);

    const applicacionPath = path.join(BASE_DIR, marcaName);
    const appDirs = await fs.readdir(applicacionPath, { withFileTypes: true });

    for (const appDir of appDirs) {
      if (!appDir.isDirectory()) continue;
      const aplicacionName = appDir.name;
      console.log(`  -> Aplicación: ${aplicacionName}`);

      const productosPath = path.join(applicacionPath, aplicacionName);
      const prodDirs = await fs.readdir(productosPath, { withFileTypes: true });

      for (const prodDir of prodDirs) {
        if (!prodDir.isDirectory()) continue;
        const prodFolderName = prodDir.name;
        
        // Extraer Código (primer token) y el resto del nombre
        const tokens = prodFolderName.split(' ');
        let code = "";
        let finalName = prodFolderName;
        
        // Si la primera palabra tiene números y letras o guiones, la tratamos como código
        if (tokens.length > 1 && /^[a-zA-Z0-9-]+$/.test(tokens[0]) && /[0-9]/.test(tokens[0])) {
           code = tokens[0];
           finalName = tokens.slice(1).join(' ');
        }
        
        const newCategory = assignCategory(finalName);
        const description = generateDescription(finalName, marcaName);
        
        const imagesPath = path.join(productosPath, prodFolderName);
        const images = await fs.readdir(imagesPath);
        const validImages = images.filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.png'));
        
        console.log(`    * Procesando: ${finalName.substring(0, 40)}... (Imágenes: ${validImages.length})`);

        let imageUrls = [];
        // Subir hasta 5 imágenes
        for (let i = 0; i < Math.min(5, validImages.length); i++) {
          const url = await uploadImage(path.join(imagesPath, validImages[i]), prodFolderName, validImages[i]);
          if (url) imageUrls.push(url);
        }

        if (imageUrls.length === 0) {
          imageUrls.push("https://placehold.co/400x400?text=Repuesto");
        }

        // Agregar fila al array de memoria
        rowsData.push({
          name: finalName,
          price: 0,
          category: newCategory,
          brand: marcaName,
          description: description,
          code_1: code,
          code_2: "",
          image_url: imageUrls[0] || "",
          image_2: imageUrls[1] || "",
          image_3: imageUrls[2] || "",
          image_4: imageUrls[3] || "",
          image_5: imageUrls[4] || ""
        });
        
        successCount++;
        await delay(150);
      }
    }
  }

  console.log(`\n============================`);
  console.log(`📝 Escribiendo archivo Excel (${successCount} productos)...`);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Plantilla Repuestos');

  sheet.columns = [
    { header: 'Nombre ✱', key: 'name', width: 40 },
    { header: 'Precio USD ✱', key: 'price', width: 14 },
    { header: 'Categoría ✱', key: 'category', width: 20 },
    { header: 'Marca', key: 'brand', width: 20 },
    { header: 'Descripción', key: 'description', width: 50 },
    { header: 'Código OEM', key: 'code_1', width: 15 },
    { header: 'Cod. Alterno', key: 'code_2', width: 15 },
    { header: 'URL Imagen', key: 'image_url', width: 35 },
    { header: 'URL Img Extra', key: 'image_2', width: 35 },
    { header: 'URL Img 3', key: 'image_3', width: 35 },
    { header: 'URL Img 4', key: 'image_4', width: 35 },
    { header: 'URL Img 5', key: 'image_5', width: 35 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F3542' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  rowsData.forEach(rowData => {
    sheet.addRow(rowData);
  });

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.font = { size: 10, color: { argb: 'FF333333' } };
      row.alignment = { vertical: 'middle', wrapText: true };
    }
  });

  const outputPath = path.join(__dirname, 'public', 'banco_imagenes_procesado.xlsx');
  await workbook.xlsx.writeFile(outputPath);

  console.log(`\n🎉 PROCESO TERMINADO!`);
  console.log(`✅ Archivo guardado con éxito en: public/banco_imagenes_procesado.xlsx`);
  console.log(`Puedes usar este archivo directamente en el importador de la página web.`);
}

run().catch(console.error);
