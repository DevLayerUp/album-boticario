INSERT INTO app_settings (key, value)
VALUES (
  'seo_settings',
  '{
    "siteName": "Álbum GB",
    "titleTemplate": "%s · Álbum Grupo Boticário",
    "defaultTitle": "Álbum de Figurinhas — Grupo Boticário",
    "defaultDescription": "Crie sua figurinha personalizada, abra pacotinhos e complete o álbum digital do Grupo Boticário.",
    "defaultOgImageUrl": null,
    "faviconUrl": "/images/favicon.png",
    "themeColor": "#0d6632",
    "twitterCard": "summary_large_image",
    "twitterSite": "",
    "robotsIndex": true,
    "robotsFollow": true,
    "routes": {
      "home": {
        "title": "Álbum Digital de Figurinhas — Grupo Boticário",
        "description": "Crie sua figurinha personalizada, abra pacotinhos, complete coleções e troque figurinhas com outros fãs do Grupo Boticário.",
        "ogImageUrl": null,
        "ogTitle": "",
        "ogDescription": "",
        "noIndex": false
      },
      "login": {
        "title": "Entrar",
        "description": "",
        "ogImageUrl": null,
        "ogTitle": "",
        "ogDescription": "",
        "noIndex": false
      },
      "register": {
        "title": "Criar conta",
        "description": "",
        "ogImageUrl": null,
        "ogTitle": "",
        "ogDescription": "",
        "noIndex": false
      },
      "esqueciSenha": {
        "title": "Esqueci minha senha",
        "description": "",
        "ogImageUrl": null,
        "ogTitle": "",
        "ogDescription": "",
        "noIndex": false
      }
    }
  }'
)
ON CONFLICT (key) DO NOTHING;
