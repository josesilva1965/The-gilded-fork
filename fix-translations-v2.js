const fs = require('fs');

const path = 'src/lib/i18n/translations.ts';
let content = fs.readFileSync(path, 'utf-8');

const ptSettings = "settings: {\n    title: 'Configurações',\n    dataManagement: 'Gerenciamento de Dados',\n    dangerZone: 'Zona de Perigo',\n    clearDatabase: 'Limpar Banco de Dados',\n    clearDatabaseDesc: 'Limpa todos os pedidos, transações e clientes. Mantém o menu e equipe.',\n    backupDatabase: 'Fazer Backup',\n    backupDatabaseDesc: 'Baixe uma cópia do banco de dados antes de fazer alterações.',\n    confirmClearTitle: 'Você tem certeza absoluta?',\n    confirmClearDesc: 'Isso excluirá todos os dados transacionais históricos.',\n    clearSuccess: 'Banco de dados limpo com sucesso.',\n    clearFailed: 'Falha ao limpar o banco de dados.',\n    backupSuccess: 'Backup baixado com sucesso.',\n    backupFailed: 'Falha ao fazer backup do banco de dados.',\n    restoreDatabase: 'Restaurar Banco de Dados',\n    restoreSuccess: 'Banco de dados restaurado com sucesso.',\n    restoreFailed: 'Falha ao restaurar o banco de dados.',\n    localization: 'Localização e Impostos',\n    localizationDesc: 'Configure sua região, idioma e substitua as taxas de imposto padrão.',\n    language: 'Idioma e Região',\n    customTaxRate: 'Taxa de Imposto Personalizada (%)',\n    resetToDefault: 'Redefinir Padrão'\n  },";

const frSettings = "settings: {\n    title: 'Paramètres',\n    dataManagement: 'Gestion des Données',\n    dangerZone: 'Zone de Danger',\n    clearDatabase: 'Effacer la Base de Données',\n    clearDatabaseDesc: 'Efface toutes les commandes, transactions et clients. Conserve le menu et le personnel.',\n    backupDatabase: 'Sauvegarder la Base',\n    backupDatabaseDesc: 'Téléchargez une copie de la base de données.',\n    confirmClearTitle: 'Êtes-vous absolument sûr ?',\n    confirmClearDesc: 'Cela supprimera toutes les données transactionnelles historiques.',\n    clearSuccess: 'Base de données effacée avec succès.',\n    clearFailed: 'Échec de l\\'effacement de la base de données.',\n    backupSuccess: 'Sauvegarde téléchargée avec succès.',\n    backupFailed: 'Échec de la sauvegarde.',\n    restoreDatabase: 'Restaurer la Base de Données',\n    restoreSuccess: 'Base de données restaurée avec succès.',\n    restoreFailed: 'Échec de la restauration.',\n    localization: 'Localisation et Taxes',\n    localizationDesc: 'Configurez votre région, langue et remplacez les taux de taxes par défaut.',\n    language: 'Langue et Région',\n    customTaxRate: 'Taux de Taxe Personnalisé (%)',\n    resetToDefault: 'Réinitialiser'\n  },";

const esSettings = "settings: {\n    title: 'Ajustes',\n    dataManagement: 'Gestión de Datos',\n    dangerZone: 'Zona de Peligro',\n    clearDatabase: 'Borrar Base de Datos',\n    clearDatabaseDesc: 'Borra todos los pedidos, transacciones y clientes. Mantiene menú y personal.',\n    backupDatabase: 'Copia de Seguridad',\n    backupDatabaseDesc: 'Descargue una copia de la base de datos antes de hacer cambios.',\n    confirmClearTitle: '¿Estás absolutamente seguro?',\n    confirmClearDesc: 'Esto eliminará todos los datos transaccionales históricos.',\n    clearSuccess: 'Base de datos borrada con éxito.',\n    clearFailed: 'Fallo al borrar la base de datos.',\n    backupSuccess: 'Copia de seguridad descargada con éxito.',\n    backupFailed: 'Fallo al hacer copia de seguridad.',\n    restoreDatabase: 'Restaurar Base de Datos',\n    restoreSuccess: 'Base de datos restaurada con éxito.',\n    restoreFailed: 'Fallo al restaurar la base de datos.',\n    localization: 'Localización e Impuestos',\n    localizationDesc: 'Configure su región, idioma y sobreescriba los impuestos por defecto.',\n    language: 'Idioma y Región',\n    customTaxRate: 'Tasa de Impuesto Personalizada (%)',\n    resetToDefault: 'Restablecer por Defecto'\n  },";

function replaceSettingsBlock(fullContent, exportName, newBlock) {
  const startIdx = fullContent.indexOf('export const ' + exportName);
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

function replaceNav(fullContent, exportName, newNav) {
  const startIdx = fullContent.indexOf('export const ' + exportName);
  if (startIdx === -1) return fullContent;
  const nextExportIdx = fullContent.indexOf('export const', startIdx + 10);
  const endIdx = nextExportIdx === -1 ? fullContent.length : nextExportIdx;
  let chunk = fullContent.substring(startIdx, endIdx);
  chunk = chunk.replace(\"settings: 'Settings'\", \"settings: '\" + newNav + \"'\");
  return fullContent.substring(0, startIdx) + chunk + fullContent.substring(endIdx);
}

content = replaceNav(content, 'ptPT', 'Configurações');
content = replaceNav(content, 'frFR', 'Paramètres');
content = replaceNav(content, 'esES', 'Ajustes');


fs.writeFileSync(path, content);
console.log('Successfully applied correct translations to all locales');
