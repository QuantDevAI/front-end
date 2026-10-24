# Filmaê — front-end

App Expo / React Native (pasta `filmae/`). Fala **somente** com o back-end.

## Pré-requisitos

- Node 20+
- npm
- Back-end no ar em http://localhost:8080 (veja o README do repo `back-end`)

## Subir

```bash
cd filmae
cp .env.example .env.local
```

Em `.env.local`:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_API_TIMEOUT_MS=10000
```

Não aponte para o `auth-microservice` (`:8081`). Login, refresh e o restante passam pela fachada do back-end.

```bash
npm install
npx expo start
```

Web (o que usamos no desenvolvimento local):

```bash
npx expo start --web --port 8082
```

Abra http://localhost:8082.

No Linux, não instale `lightningcss-win32-x64-msvc` (é só Windows). Se o `npm install` falhar por isso, remova essa dependência do `package.json` e rode de novo.

## Fluxo

1. `docker compose up --build` no repo `back-end`
2. Este front com `EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1`
3. Cadastro / login no app; o token vai no header `Authorization`

Quem ainda não terminou o onboarding cai nas telas de gêneros / filmes / perfil, não na home.
