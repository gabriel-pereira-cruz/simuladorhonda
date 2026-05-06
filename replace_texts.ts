import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (path: string) => void) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath, callback);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      callback(fullPath);
    }
  }
}

walk('./src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace 'unidades' with 'motos (unidades de produção)' globally, carefully avoiding breaking stuff
  if (!filePath.includes('dashboard.service.ts') && !filePath.includes('Reports/index.tsx')) {
    content = content.replace(/unidades/g, 'motos (unidades de produção)');
  }
  
  if (filePath.includes('SimulationShell.tsx')) {
    // Add info of period Ano Ki to history
    // Current: {s.id} · Cenário {s.tipo} · {s.criador}
    // New: {s.id} · Cenário {s.tipo} · Ano Ki26 (Abr/26 a Mar/27) · {s.criador}
    content = content.replace(/\{s.id\} · Cenário \{s.tipo\} · \{s.criador\}/g, '{s.id} · Cenário {s.tipo} · Ano Ki26 (Abr/26 a Mar/27) · {s.criador}');
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
  }
});
