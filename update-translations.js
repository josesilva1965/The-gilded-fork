const fs = require('fs');

const path = 'src/lib/i18n/translations.ts';
let content = fs.readFileSync(path, 'utf-8');

// 1. Add settings to nav type
content = content.replace(
  /transactions: string;\n\s+\};/g,
  "transactions: string;\n    settings: string;\n  };"
);

// 2. Add settings block to Translations type
const settingsType = `
  settings: {
    title: string;
    dataManagement: string;
    dangerZone: string;
    clearDatabase: string;
    clearDatabaseDesc: string;
    backupDatabase: string;
    backupDatabaseDesc: string;
    confirmClearTitle: string;
    confirmClearDesc: string;
    clearSuccess: string;
    clearFailed: string;
    backupSuccess: string;
    backupFailed: string;
  };
`;
content = content.replace(
  /  \/\/ ─── Footer ───/g,
  `  // ─── Settings ───\n${settingsType}\n  // ─── Footer ───`
);

// 3. Add to locales
const locales = [
  {
    regex: /transactions: 'Transactions',\n\s+\},/g,
    navStr: "transactions: 'Transactions',\n    settings: 'Settings',\n  },",
    settingsStr: `
  settings: {
    title: 'Settings',
    dataManagement: 'Data Management',
    dangerZone: 'Danger Zone',
    clearDatabase: 'Clear Database',
    clearDatabaseDesc: 'Wipes all orders, transactions, and customers. Keeps menu and staff.',
    backupDatabase: 'Backup Database',
    backupDatabaseDesc: 'Download a copy of the database before making changes.',
    confirmClearTitle: 'Are you absolutely sure?',
    confirmClearDesc: 'This will delete all historical transactional data.',
    clearSuccess: 'Database cleared successfully.',
    clearFailed: 'Failed to clear database.',
    backupSuccess: 'Backup downloaded successfully.',
    backupFailed: 'Failed to backup database.'
  },
`
  },
  {
    regex: /transactions: 'Transacciones',\n\s+\},/g,
    navStr: "transactions: 'Transacciones',\n    settings: 'Ajustes',\n  },",
    settingsStr: `
  settings: {
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
    backupFailed: 'Fallo al hacer copia de seguridad.'
  },
`
  },
  {
    regex: /transactions: 'Transações',\n\s+\},/g,
    navStr: "transactions: 'Transações',\n    settings: 'Configurações',\n  },",
    settingsStr: `
  settings: {
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
    backupFailed: 'Falha ao fazer backup do banco de dados.'
  },
`
  },
  {
    regex: /transactions: 'Transactions',\n\s+\},/g,
    navStr: "transactions: 'Transactions',\n    settings: 'Paramètres',\n  },",
    settingsStr: `
  settings: {
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
    backupFailed: 'Échec de la sauvegarde.'
  },
`
  }
];

// Apply nav changes
content = content.replace(/transactions: 'Transactions',\n\s+\},/g, "transactions: 'Transactions',\n    settings: 'Settings',\n  },");
content = content.replace(/transactions: 'Transacciones',\n\s+\},/g, "transactions: 'Transacciones',\n    settings: 'Ajustes',\n  },");
content = content.replace(/transactions: 'Transações',\n\s+\},/g, "transactions: 'Transações',\n    settings: 'Configurações',\n  },");

// The French block has `transactions: 'Transactions'` too, let's just do a blanket insert of the settings block before footer in locales
content = content.replace(/  footer: \{/g, "  settings: {\n    title: 'Settings',\n    dataManagement: 'Data Management',\n    dangerZone: 'Danger Zone',\n    clearDatabase: 'Clear Database',\n    clearDatabaseDesc: 'Wipes all orders, transactions, and customers. Keeps menu and staff.',\n    backupDatabase: 'Backup Database',\n    backupDatabaseDesc: 'Download a copy of the database before making changes.',\n    confirmClearTitle: 'Are you absolutely sure?',\n    confirmClearDesc: 'This will delete all historical transactional data.',\n    clearSuccess: 'Database cleared successfully.',\n    clearFailed: 'Failed to clear database.',\n    backupSuccess: 'Backup downloaded successfully.',\n    backupFailed: 'Failed to backup database.'\n  },\n  footer: {");

fs.writeFileSync(path, content);
console.log('Updated translations');
