import fs from 'fs';
import path from 'path';

const schemaDir = 'lib/db/schema';
const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
    const filePath = path.join(schemaDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Find imports block
    const importMatch = content.match(/from "drizzle-orm\/mysql-core";/);
    if (importMatch) {
        // Simple deduplication for the whole file since we only care about identifiers
        const lines = content.split('\n');
        const uniqueLines = [];
        const seenImports = new Set();
        
        let inImportBlock = false;
        for (let line of lines) {
            if (line.includes('from "drizzle-orm/mysql-core";')) {
                inImportBlock = false;
                uniqueLines.push(line);
                continue;
            }
            if (line.includes('import {') && line.includes('} from "drizzle-orm/mysql-core"')) {
                // Single line import
                const parts = line.match(/import \{ (.*) \} from/);
                if (parts) {
                    const ids = parts[1].split(',').map(s => s.trim()).filter(s => !!s);
                    const uniqueIds = ids.filter(id => {
                        if (seenImports.has(id)) return false;
                        seenImports.add(id);
                        return true;
                    });
                    uniqueLines.push(`import { ${uniqueIds.join(', ')} } from ${line.split('} from')[1]}`);
                    continue;
                }
            }
            
            if (line.trim() === 'import {' || line.trim().startsWith('import {')) inImportBlock = true;
            
            if (inImportBlock) {
                const idMatch = line.match(/^\s*([a-zA-Z0-9_]+),?\s*$/);
                if (idMatch) {
                    const id = idMatch[1];
                    if (seenImports.has(id)) {
                        continue; // Skip duplicate
                    }
                    seenImports.add(id);
                }
            }
            
            uniqueLines.push(line);
        }
        
        fs.writeFileSync(filePath, uniqueLines.join('\n'));
    }
});
