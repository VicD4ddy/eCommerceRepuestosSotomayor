import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => {
  const match = envFile.match(new RegExp(`${key}="(.*?)"`)) || envFile.match(new RegExp(`${key}=(.*)`));
  return match ? match[1].trim() : undefined;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);

// Normalizar texto quitando acentos y mayúsculas
const normalizeText = (text) => {
  return (text || '')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
};

async function run() {
  console.log("=== 1. NORMALIZANDO NOMBRES DE CATEGORÍAS EN LA BD ===");
  const { data: categories, error: catError } = await supabase.from('categories').select('*');
  if (catError) {
    console.error("Error al cargar categorías:", catError.message);
    return;
  }

  // Corregir espacios finales y mayúsculas/minúsculas en nombres de categorías
  for (const cat of categories) {
    const trimmedName = cat.name.trim();
    if (cat.name !== trimmedName) {
      console.log(`Normalizando categoría ID ${cat.id}: "${cat.name}" -> "${trimmedName}"`);
      await supabase.from('categories').update({ name: trimmedName }).eq('id', cat.id);
      cat.name = trimmedName;
    }
  }

  // Crear un mapa de nombre normalizado -> id de categoría
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[normalizeText(cat.name)] = cat;
  });

  console.log(`Categorías disponibles: ${Object.keys(categoryMap).length}`);

  // Reglas de emparejamiento (de más específicas a más generales)
  // Las reglas emparejan palabras clave con el nombre exacto de la categoría en la BD
  const rules = [
    { cat: "Bombas de Aceite", keywords: ["BOMBA DE ACEITE", "BOMBA ACEITE", "OIL PUMP"] },
    { cat: "Bombas de Agua", keywords: ["BOMBA DE AGUA", "BOMBA AGUA", "WATER PUMP"] },
    { cat: "Bombas de Gasolina", keywords: ["BOMBA DE GASOLINA", "BOMBA GASOLINA", "PILA DE GASOLINA", "PILA GASOLINA", "FUEL PUMP"] },
    { cat: "Gorros de Valvula", keywords: ["GORRO DE VALVULA", "GORROS DE VALVULA", "GORRO VALVULA", "GORROS DE VÁLVULA", "VALVE STEM SEAL"] },
    { cat: "Pastillas de Freno", keywords: ["PASTILLA DE FRENO", "PASTILLAS DE FRENO", "PASTILLAS", "BRAKE PAD", "ZAPATA", "BANDAS DE FRENO"] },
    { cat: "Discos de Freno", keywords: ["DISCO DE FRENO", "DISCOS DE FRENO", "DISCO FRENO", "BRAKE ROTOR", "TAMBOR DE FRENO", "TAMBOR"] },
    { cat: "Base de Motor", keywords: ["BASE DE MOTOR", "BASE MOTOR", "SOPORTE MOTOR", "SOPORTE DE MOTOR", "BASE CAJA", "BASE DE CAJA", "SOPORTE DE CAJA", "BASE AMORTIGUADOR"] },
    { cat: "Barra Corta", keywords: ["BARRA CORTA", "BARRA DE DIRECCION CORTA"] },
    { cat: "Barra Larga", keywords: ["BARRA LARGA", "BARRA DE DIRECCION LARGA"] },
    { cat: "Brazo Loco", keywords: ["BRAZO LOCO", "IDLER ARM"] },
    { cat: "Brazo Pitman", keywords: ["BRAZO PITMAN", "PITMAN ARM"] },
    { cat: "Lapiz Estabilizador", keywords: ["LAPIZ ESTABILIZADOR", "LAPIZ DE BARRA", "BIELÉTA", "BIELETA", "SWAY BAR LINK"] },
    { cat: "Gomas Barra Estabilizadora", keywords: ["GOMA BARRA ESTABILIZADORA", "GOMAS BARRA ESTABILIZADORA", "GOMA BARRA", "GOMAS DE BARRA"] },
    { cat: "Gomas Tensoras", keywords: ["GOMA TENSORA", "GOMAS TENSORAS", "GOMA TENSOR"] },
    { cat: "Unión Terminal", keywords: ["UNION TERMINAL", "UNIÓN TERMINAL"] },
    { cat: "Tiempo", keywords: ["KIT DE TIEMPO", "JUEGO DE TIEMPO", "CADENA DE TIEMPO", "TENSOR DE TIEMPO", "PATIN DE TIEMPO", "ENGRANAJE DE TIEMPO", "TIMING KIT", "TIMING CHAIN", "TENSOR"] },
    { cat: "Aceites y Lubricantes", keywords: ["ACEITE", "LUBRICANTE", "VALVULINA", "GRASA", "LIQUIDO DE FRENO", "REFRIGERANTE", "COOLANT", "DOT 3", "DOT 4", "5W30", "10W30", "15W40", "20W50"] },
    { cat: "Embragues", keywords: ["EMBRAGUE", "CLUTCH", "KIT DE CLUTCH", "PLATO Y DISCO", "BOMBA DE CLUTCH", "BOMBÍN DE CLUTCH", "BOMBIN DE CLUTCH", "COLLARIN"] },
    
    // Palabras individuales o más generales
    { cat: "Amortiguadores", keywords: ["AMORTIGUADOR", "AMORTIGUADORES", "STRUT", "SHOCK"] },
    { cat: "Anillos", keywords: ["ANILLO", "ANILLOS", "RING", "RINGS"] },
    { cat: "Bielas", keywords: ["CONCHA DE BIELA", "BIELA", "BIELAS", "ROD BEARING"] },
    { cat: "Bancadas", keywords: ["CONCHA DE BANCADA", "BANCADA", "BANCADAS", "MAIN BEARING", "CONCHAS"] },
    { cat: "Estoperas", keywords: ["ESTOPERA", "ESTOPERAS", "SEAL", "OIL SEAL", "RETEN", "RETENEDOR"] },
    { cat: "Empacaduras", keywords: ["EMPACADURA", "EMPACADURAS", "GASKET", "KIT DE EMPACADURAS", "JUEGO DE EMPACADURAS", "ORING", "O-RING"] },
    { cat: "Correas", keywords: ["CORREA", "CORREAS", "BELT", "MULTI-V"] },
    { cat: "Filtros", keywords: ["FILTRO", "FILTROS", "FILTER"] },
    { cat: "Pistones", keywords: ["PISTON", "PISTONES", "EMBOLO"] },
    { cat: "Valvulas", keywords: ["VALVULA", "VALVULAS", "VÁLVULA", "VÁLVULAS", "VALVE"] },
    { cat: "Taquetes", keywords: ["TAQUETE", "TAQUETES", "LIFTER", "LIFTERS"] },
    { cat: "Muñones", keywords: ["MUÑON", "MUÑONES", "BALL JOINT"] },
    { cat: "Terminales", keywords: ["TERMINAL", "TERMINALES", "TIE ROD END"] },
    { cat: "Mesetas", keywords: ["MESETA", "MESETAS", "CONTROL ARM"] },
    { cat: "Rotulas", keywords: ["ROTULA", "ROTULAS", "RÓTULA"] },
    { cat: "Bujes", keywords: ["BUJE", "BUJES", "BUSHING"] },
    { cat: "Bujías", keywords: ["BUJIA", "BUJIAS", "SPARK PLUG"] },
    { cat: "Crucetas", keywords: ["CRUCETA", "CRUCETAS", "U-JOINT"] },
  ];

  console.log("\n=== 2. CARGANDO PRODUCTOS SIN CATEGORÍA ===");
  // Cargar todos los productos (con o sin categoría para ver si falta category_id)
  const { data: products, error: prodError } = await supabase.from('products').select('id, name, description, code, category_id, categories(name)');
  if (prodError) {
    console.error("Error al cargar productos:", prodError.message);
    return;
  }

  const unassigned = products.filter(p => !p.category_id || !p.categories);
  console.log(`Productos sin categoría: ${unassigned.length} de ${products.length} productos totales`);

  let updatedCount = 0;
  let unmatchedCount = 0;
  const matchCounts = {};

  console.log("\n=== 3. EMPAREJANDO Y ACTUALIZANDO PRODUCTOS ===");
  
  for (const product of unassigned) {
    const textToMatch = normalizeText(`${product.name} ${product.description || ''}`);
    let matchedCategory = null;

    for (const rule of rules) {
      // Buscar la categoría real en categoryMap
      const catObj = categories.find(c => normalizeText(c.name) === normalizeText(rule.cat));
      if (!catObj) continue;

      for (const kw of rule.keywords) {
        // Coincidencia de palabra completa o substring significativo
        const normKw = normalizeText(kw);
        // Si la palabra clave aparece como palabra o frase en textToMatch
        // Usar regex con límites o indexOf si es frase
        const regex = new RegExp(`\\b${normKw}\\b`, 'i');
        if (regex.test(textToMatch) || textToMatch.includes(normKw)) {
          matchedCategory = catObj;
          break;
        }
      }
      if (matchedCategory) break;
    }

    if (matchedCategory) {
      const { error: updateErr } = await supabase
        .from('products')
        .update({ category_id: matchedCategory.id })
        .eq('id', product.id);

      if (updateErr) {
        console.error(`Error actualizando producto ${product.id} (${product.name}):`, updateErr.message);
      } else {
        updatedCount++;
        matchCounts[matchedCategory.name] = (matchCounts[matchedCategory.name] || 0) + 1;
      }
    } else {
      unmatchedCount++;
      // Muestra solo los primeros 10 no emparejados para no saturar consola
      if (unmatchedCount <= 10) {
        console.log(`  [No emparejado] "${product.name}"`);
      }
    }
  }

  console.log("\n=== RESUMEN DE ASIGNACIÓN AUTOMÁTICA ===");
  console.log(`Productos actualizados exitosamente: ${updatedCount}`);
  console.log(`Productos sin emparejar: ${unmatchedCount}`);
  console.log("\nRepuestos asignados por categoría en este lote:");
  Object.entries(matchCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([catName, count]) => {
      console.log(`  - ${catName}: +${count} productos`);
    });
}

run();
