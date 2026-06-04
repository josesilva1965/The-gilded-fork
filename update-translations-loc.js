const fs = require('fs');

const path = 'src/lib/i18n/translations.ts';
let content = fs.readFileSync(path, 'utf-8');

// 1. Add to the type
content = content.replace(
  /restoreFailed: string;\n  };/g,
  "restoreFailed: string;\n    localization: string;\n    localizationDesc: string;\n    language: string;\n    customTaxRate: string;\n    resetToDefault: string;\n  };"
);

// 2. English
content = content.replace(
  /restoreFailed: 'Failed to restore database.'\n  },/g,
  "restoreFailed: 'Failed to restore database.',\n    localization: 'Localization & Tax',\n    localizationDesc: 'Configure your region, language, and override default tax rates.',\n    language: 'Language & Region',\n    customTaxRate: 'Custom Tax Rate (%)',\n    resetToDefault: 'Reset to Default'\n  },"
);

// 3. Spanish
content = content.replace(
  /restoreFailed: 'Fallo al restaurar la base de datos.'\n  },/g,
  "restoreFailed: 'Fallo al restaurar la base de datos.',\n    localization: 'Localización e Impuestos',\n    localizationDesc: 'Configure su región, idioma y sobreescriba los impuestos por defecto.',\n    language: 'Idioma y Región',\n    customTaxRate: 'Tasa de Impuesto Personalizada (%)',\n    resetToDefault: 'Restablecer por Defecto'\n  },"
);

// 4. Portuguese
content = content.replace(
  /restoreFailed: 'Falha ao restaurar o banco de dados.'\n  },/g,
  "restoreFailed: 'Falha ao restaurar o banco de dados.',\n    localization: 'Localização e Impostos',\n    localizationDesc: 'Configure sua região, idioma e substitua as taxas de imposto padrão.',\n    language: 'Idioma e Região',\n    customTaxRate: 'Taxa de Imposto Personalizada (%)',\n    resetToDefault: 'Redefinir Padrão'\n  },"
);

// 5. French
content = content.replace(
  /restoreFailed: 'Échec de la restauration.'\n  },/g,
  "restoreFailed: 'Échec de la restauration.',\n    localization: 'Localisation et Taxes',\n    localizationDesc: 'Configurez votre région, langue et remplacez les taux de taxes par défaut.',\n    language: 'Langue et Région',\n    customTaxRate: 'Taux de Taxe Personnalisé (%)',\n    resetToDefault: 'Réinitialiser'\n  },"
);

fs.writeFileSync(path, content);
console.log('Updated translations with localization feature');
