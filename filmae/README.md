# Filmaê (app)

## Subir o app

Na raiz desta pasta:

```bash
cp .env.example .env.local
```

`.env.local`:

```
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_API_TIMEOUT_MS=10000
```

```bash
npm install
npx expo start --web --port 8082
```

O back-end precisa estar em http://localhost:8080. Instruções no README do repo `back-end`.

## Scripts

```bash
npm start          # expo start
npm run web        # expo start --web
npm run android
npm run ios
npm run check      # typecheck + lint + format
```
