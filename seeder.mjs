import fs from 'fs/promises';
import { existsSync, createReadStream } from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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
  console.error("\n❌ Error: Debes proporcionar tu email y contraseña de administrador para saltar las políticas RLS.");
  console.error("💡 Uso correcto: node --env-file=.env.local seeder.mjs <tu_email> <tu_contraseña>\n");
  process.exit(1);
}

// Función helper para crear un delay y no saturar la API
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const BASE_DIR = path.join(process.cwd(), 'public', 'Banco Imagenes App', 'Banco Imagenes App');

async function getOrCreateCategory(name) {
  const { data, error } = await supabase.from('categories').select('id').eq('name', name).single();
  if (data) return data.id;
  
  const { data: newCat, error: insertErr } = await supabase.from('categories').insert([{ name, icon: 'Package' }]).select().single();
  if (insertErr) throw insertErr;
  return newCat.id;
}

async function getOrCreateBrand(name) {
  const { data, error } = await supabase.from('brands').select('id').eq('name', name).single();
  if (data) return data.id;
  
  const { data: newBrand, error: insertErr } = await supabase.from('brands').insert([{ name }]).select().single();
  if (insertErr) throw insertErr;
  return newBrand.id;
}

async function uploadImage(filePath, folderName, fileName) {
  const destPath = `import/${folderName.replace(/[^a-zA-Z0-9]/g, '_')}_${fileName}`;
  
  try {
    const fileBuffer = await fs.readFile(filePath);
    const { data, error } = await supabase.storage
      .from('products')
      .upload(destPath, fileBuffer, { contentType: 'image/jpeg', upsert: true });

    if (error) {
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
  console.log("Iniciando sesión como administrador...");
  const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
  if (authErr) {
    console.error("❌ Error iniciando sesión:", authErr.message);
    process.exit(1);
  }
  console.log("✅ Sesión iniciada correctamente.");

  console.log("Iniciando escaneo de la carpeta local...");
  
  if (!existsSync(BASE_DIR)) {
    console.error("El directorio base no existe:", BASE_DIR);
    console.error("Asegúrate de que la ruta public/Banco Imagenes App/Banco Imagenes App existe.");
    process.exit(1);
  }

  const categoryId = await getOrCreateCategory("Catálogo Importado");
  console.log(`✅ Categoría Genérica obtenida: ${categoryId}`);

  const marcasDirs = await fs.readdir(BASE_DIR, { withFileTypes: true });
  
  let successCount = 0;
  let failCount = 0;

  for (const marcaDir of marcasDirs) {
    if (!marcaDir.isDirectory()) continue;
    const marcaName = marcaDir.name;
    const marcaId = await getOrCreateBrand(marcaName);
    console.log(`\n============================`);
    console.log(`📦 Procesando Marca: ${marcaName} (ID: ${marcaId})`);

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
        
        const description = `Aplicación: ${aplicacionName}.\nCarpeta original: ${prodFolderName}`;
        
        const imagesPath = path.join(productosPath, prodFolderName);
        const images = await fs.readdir(imagesPath);
        const validImages = images.filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.png'));
        
        let imageUrl1 = "https://placehold.co/400x400?text=Repuesto";
        let imageUrl2 = null;

        console.log(`    * Procesando producto: ${finalName.substring(0, 40)}... (Imágenes: ${validImages.length})`);

        if (validImages.length > 0) {
          imageUrl1 = await uploadImage(path.join(imagesPath, validImages[0]), prodFolderName, validImages[0]) || imageUrl1;
        }
        if (validImages.length > 1) {
          imageUrl2 = await uploadImage(path.join(imagesPath, validImages[1]), prodFolderName, validImages[1]);
        }

        const payload = {
          name: finalName,
          price: 0, // Precio por defecto 0
          description: description,
          code_1: code || null,
          category_id: categoryId,
          brand_id: marcaId,
          image_url: imageUrl1,
          image_2: imageUrl2,
          stock_status: false // Desactivado por defecto para que el admin lo revise
        };

        const { error: prodErr } = await supabase.from('products').insert([payload]);
        if (prodErr) {
          console.error(`      ❌ Error insertando BD para ${code}: ${prodErr.message}`);
          failCount++;
        } else {
          successCount++;
          console.log(`      ✅ Insertado correctamente.`);
        }
        
        // Pequeño delay para no rate-limitar Supabase Storage y DB
        await delay(150);
      }
    }
  }

  console.log(`\n🎉 PROCESO TERMINADO!`);
  console.log(`✅ ${successCount} productos importados exitosamente.`);
  if (failCount > 0) console.log(`❌ ${failCount} productos fallaron.`);
}

run().catch(console.error);
