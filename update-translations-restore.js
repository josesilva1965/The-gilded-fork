const fs = require('fs');

const path = 'src/lib/i18n/translations.ts';
let content = fs.readFileSync(path, 'utf-8');

// 1. Add to the type
content = content.replace(
  /backupFailed: string;\n  };/g,
  "backupFailed: string;\n    restoreDatabase: string;\n    restoreSuccess: string;\n    restoreFailed: string;\n  };"
);

// 2. English
content = content.replace(
  /backupFailed: 'Failed to backup database.'\n  },/g,
  "backupFailed: 'Failed to backup database.',\n    restoreDatabase: 'Restore Database',\n    restoreSuccess: 'Database restored successfully.',\n    restoreFailed: 'Failed to restore database.'\n  },"
);

// 3. Spanish
content = content.replace(
  /backupFailed: 'Fallo al hacer copia de seguridad.'\n  },/g,
  "backupFailed: 'Fallo al hacer copia de seguridad.',\n    restoreDatabase: 'Restaurar Base de Datos',\n    restoreSuccess: 'Base de datos restaurada con éxito.',\n    restoreFailed: 'Fallo al restaurar la base de datos.'\n  },"
);

// 4. Portuguese
content = content.replace(
  /backupFailed: 'Falha ao fazer backup do banco de dados.'\n  },/g,
  "backupFailed: 'Falha ao fazer backup do banco de dados.',\n    restoreDatabase: 'Restaurar Banco de Dados',\n    restoreSuccess: 'Banco de dados restaurado com sucesso.',\n    restoreFailed: 'Falha ao restaurar o banco de dados.'\n  },"
);

// 5. French
content = content.replace(
  /backupFailed: 'Échec de la sauvegarde.'\n  },/g,
  "backupFailed: 'Échec de la sauvegarde.',\n    restoreDatabase: 'Restaurer la Base de Données',\n    restoreSuccess: 'Base de données restaurée avec succès.',\n    restoreFailed: 'Échec de la restauration.'\n  },"
);

fs.writeFileSync(path, content);
console.log('Updated translations with restore functionality');
