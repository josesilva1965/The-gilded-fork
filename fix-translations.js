const fs = require('fs');

const path = 'src/lib/i18n/translations.ts';
let content = fs.readFileSync(path, 'utf-8');

const ptSettings = `settings: {
    title: 'Configurações',
    dataManagement: 'Gerenciamento de Dados',
    dangerZone: 'Zona de Perigo',
    clearDatabase: 'Limpar Banco de Dados',
    clearDatabaseDesc: 'Limpa todos os pedidos, transações e clientes. Mantém o menu e equipe.',
    backupDatabase: 'Fazer Backup',
    backupDatabaseDesc: 'Baixe uma cópia do banco de dados antes de fazer alterações.',
    confirmClearTitle: 'Você tem certeza absoluta?',
    confirmClearDesc: 'Isso excluirá todos os dados transacionais históricos.',
    clearSuccess: 'Banco de dados limpo com sucesso.',
    clearFailed: 'Falha ao limpar o banco de dados.',
    backupSuccess: 'Backup baixado com sucesso.',
    backupFailed: 'Falha ao fazer backup do banco de dados.',
    restoreDatabase: 'Restaurar Banco de Dados',
    restoreSuccess: 'Banco de dados restaurado com sucesso.',
    restoreFailed: 'Falha ao restaurar o banco de dados.',
    localization: 'Localização e Impostos',
    localizationDesc: 'Configure sua região, idioma e substitua as taxas de imposto padrão.',
    language: 'Idioma e Região',
    customTaxRate: 'Taxa de Imposto Personalizada (%)',
    resetToDefault: 'Redefinir Padrão'
  },`;

const frSettings = `settings: {
    title: 'Paramètres',
    dataManagement: 'Gestion des Données',
    dangerZone: 'Zone de Danger',
    clearDatabase: 'Effacer la Base de Données',
    clearDatabaseDesc: 'Efface toutes les commandes, transactions et clients. Conserve le menu et le personnel.',
    backupDatabase: 'Sauvegarder la Base',
    backupDatabaseDesc: 'Téléchargez une copie de la base de données.',
    confirmClearTitle: 'Êtes-vous absolument sûr ?',
    confirmClearDesc: 'Cela supprimera toutes les données transactionnelles historiques.',
    clearSuccess: 'Base de données effacée avec succès.',
    clearFailed: 'Échec de l\\'effacement de la base de données.',
    backupSuccess: 'Sauvegarde téléchargée avec succès.',
    backupFailed: 'Échec de la sauvegarde.',
    restoreDatabase: 'Restaurer la Base de Données',
    restoreSuccess: 'Base de données restaurée avec succès.',
    restoreFailed: 'Échec de la restauration.',
    localization: 'Localisation et Taxes',
    localizationDesc: 'Configurez votre région, langue et remplacez les taux de taxes par défaut.',
    language: 'Langue et Région',
    customTaxRate: 'Taux de Taxe Personnalisé (%)',
    resetToDefault: 'Réinitialiser'
  },`;

const esSettings = `settings: {
    title: 'Ajustes',
    dataManagement: 'Gestión de Datos',
    dangerZone: 'Zona de Peligro',
    clearDatabase: 'Borrar Base de Datos',
    clearDatabaseDesc: 'Borra todos los pedidos, transacciones y clientes. Mantiene menú y personal.',
    backupDatabase: 'Copia de Seguridad',
    backupDatabaseDesc: 'Descargue una copia de la base de datos antes de hacer cambios.',
    confirmClearTitle: '¿Estás absolutamente seguro?',
    confirmClearDesc: 'Esto eliminará todos los datos transaccionales históricos.',
    clearSuccess: 'Base de datos borrada con éxito.',
    clearFailed: 'Fallo al borrar la base de datos.',
    backupSuccess: 'Copia de seguridad descargada con éxito.',
    backupFailed: 'Fallo al hacer copia de seguridad.',
    restoreDatabase: 'Restaurar Base de Datos',
    restoreSuccess: 'Base de datos restaurada con éxito.',
    restoreFailed: 'Fallo al restaurar la base de datos.',
    localization: 'Localización e Impuestos',
    localizationDesc: 'Configure su región, idioma y sobreescriba los impuestos por defecto.',
    language: 'Idioma y Región',
    customTaxRate: 'Tasa de Impuesto Personalizada (%)',
    resetToDefault: 'Restablecer por Defecto'
  },`;


function replaceSettingsBlock(fullContent, exportName, newBlock) {
  const startIdx = fullContent.indexOf(\`export const \${exportName}\`);
  if (startIdx === -1) return fullContent;
  
  const nextExportIdx = fullContent.indexOf('export const', startIdx + 10);
  const endIdx = nextExportIdx === -1 ? fullContent.length : nextExportIdx;
  
  const chunk = fullContent.substring(startIdx, endIdx);
  
  const settingsStart = chunk.indexOf('settings: {');
  if (settingsStart === -1) return fullContent;
  
  const footerStart = chunk.indexOf('footer: {', settingsStart);
  if (footerStart === -1) return fullContent;
  
  const newChunk = chunk.substring(0, settingsStart) + newBlock + "\\n  " + chunk.substring(footerStart);
  return fullContent.substring(0, startIdx) + newChunk + fullContent.substring(endIdx);
}

content = replaceSettingsBlock(content, 'ptPT', ptSettings);
content = replaceSettingsBlock(content, 'frFR', frSettings);
content = replaceSettingsBlock(content, 'esES', esSettings);

// Also fix the 'settings' value in the 'nav' block for the other languages
function replaceNav(fullContent, exportName, oldNav, newNav) {
  const startIdx = fullContent.indexOf(\`export const \${exportName}\`);
  if (startIdx === -1) return fullContent;
  const nextExportIdx = fullContent.indexOf('export const', startIdx + 10);
  const endIdx = nextExportIdx === -1 ? fullContent.length : nextExportIdx;
  let chunk = fullContent.substring(startIdx, endIdx);
  chunk = chunk.replace(\`settings: 'Settings'\`, \`settings: '\${newNav}'\`);
  return fullContent.substring(0, startIdx) + chunk + fullContent.substring(endIdx);
}

content = replaceNav(content, 'ptPT', 'Settings', 'Configurações');
content = replaceNav(content, 'frFR', 'Settings', 'Paramètres');
content = replaceNav(content, 'esES', 'Settings', 'Ajustes');


fs.writeFileSync(path, content);
console.log('Successfully applied correct translations to all locales');
