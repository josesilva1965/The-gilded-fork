const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const sqliteSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.sqlite.prisma');
const sqliteDbPath = path.join(__dirname, '..', 'prisma', 'dev.db');

console.log('--- Starting Windows Standalone SQLite Build ---');

try {
  // 1. Read current PostgreSQL schema
  let schema = fs.readFileSync(schemaPath, 'utf-8');

  // 2. Modify datasource block for SQLite
  // Find the datasource block and replace it
  const datasourceRegex = /datasource\s+db\s*{[^}]*}/m;
  const sqliteDatasource = `datasource db {\n  provider = "sqlite"\n  url      = "file:./dev.db"\n}`;
  
  if (!datasourceRegex.test(schema)) {
    throw new Error("Could not find datasource block in schema.prisma");
  }

  schema = schema.replace(datasourceRegex, sqliteDatasource);

  // 3. Write to temporary sqlite schema
  fs.writeFileSync(sqliteSchemaPath, schema);
  console.log('✅ Generated schema.sqlite.prisma');

  // 4. Ensure we start with a fresh SQLite DB
  if (fs.existsSync(sqliteDbPath)) {
    fs.unlinkSync(sqliteDbPath);
    console.log('✅ Cleared old SQLite database');
  }

  // 5. Run Prisma DB Push to create the SQLite tables (bypasses migrations)
  console.log('⏳ Running Prisma db push for SQLite...');
  execSync('npx prisma db push --schema=prisma/schema.sqlite.prisma --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ SQLite Database created');

  // 6. Generate Prisma Client for SQLite
  console.log('⏳ Generating Prisma Client for SQLite...');
  execSync('npx prisma generate --schema=prisma/schema.sqlite.prisma', { stdio: 'inherit' });
  console.log('✅ Prisma Client configured for SQLite');

  // 7. Run database seed (assuming check-db.js or similar exists, we can run it, but let's just generate for now)
  // If there's a specific seed script, it can be added here.
  // We will run the standard build
  console.log('⏳ Building Next.js application...');
  fs.writeFileSync('.env.production.local', 'NEXT_PUBLIC_IS_LOCAL_KIOSK=true');
  
  try {
    execSync('npx next build && node -e "const fs = require(\'fs\'); fs.cpSync(\'.next/static\', \'.next/standalone/.next/static\', {recursive: true, force: true}); fs.cpSync(\'public\', \'.next/standalone/public\', {recursive: true, force: true});"', { stdio: 'inherit' });
  } finally {
    if (fs.existsSync('.env.production.local')) {
      fs.unlinkSync('.env.production.local');
    }
  }
  console.log('✅ Next.js build completed');

  console.log('⏳ Packaging Windows Executables...');
  fs.mkdirSync('.next/standalone/prisma', { recursive: true });
  if (fs.existsSync('prisma/dev.db')) {
    fs.cpSync('prisma/dev.db', '.next/standalone/prisma/dev.db', { force: true });
  }
  
  const batContent = `@echo off\ntitle The Gilded Fork Server\necho ============================================\necho   Starting The Gilded Fork Local Server... \necho ============================================\necho.\necho Launching Fullscreen POS Interface...\necho.\nset NODE_ENV=production\nset PORT=3000\nset NEXT_PUBLIC_IS_LOCAL_KIOSK=true\n\nREM Attempt to open Chrome in fullscreen App mode, fallback to Edge (disabling cache to ensure fresh updates)\nstart chrome --app=http://localhost:3000/management --kiosk --disable-http-cache || start msedge --app=http://localhost:3000/management --kiosk --disable-http-cache\n\nnode server.js`;
  fs.writeFileSync('.next/standalone/Start-Server.bat', batContent);
  console.log('✅ Generated Start-Server.bat executable');

  // Generate Windows Shortcut (.lnk) with the beautiful app icon
  console.log('⏳ Generating Windows Desktop Shortcut with Custom Icon...');
  try {
    const rootDir = process.cwd();
    const shortcutPath = path.join(rootDir, 'The Gilded Fork POS.lnk');
    const targetPath = path.join(rootDir, 'Launch-POS.bat');
    const iconPath = path.join(rootDir, 'public', 'app-icon.ico');
    
    // PowerShell command to create shortcut
    const psCommand = `
      $WshShell = New-Object -ComObject WScript.Shell;
      $Shortcut = $WshShell.CreateShortcut('${shortcutPath}');
      $Shortcut.TargetPath = '${targetPath}';
      $Shortcut.WorkingDirectory = '${rootDir}';
      $Shortcut.IconLocation = '${iconPath}';
      $Shortcut.Save();
    `.replace(/\s+/g, ' ').trim();
    
    execSync(`powershell -Command "${psCommand}"`, { stdio: 'ignore' });
    console.log('✅ Generated "The Gilded Fork POS" shortcut in root folder');
  } catch (lnkError) {
    console.warn('⚠️ Could not generate shortcut:', lnkError.message);
  }

  console.log('--- Windows Build Complete! ---');
  console.log('The portable app is fully packaged in .next/standalone');

} catch (error) {
  console.error('❌ Build Failed:', error.message);
} finally {
  // 8. Restore the PostgreSQL Prisma Client so the developer's environment isn't broken
  console.log('⏳ Restoring PostgreSQL Prisma Client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ PostgreSQL Prisma Client restored successfully.');
  } catch (restoreError) {
    console.error('❌ Failed to restore PostgreSQL Prisma Client:', restoreError.message);
  }
}
