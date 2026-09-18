# Filmae - Regras para desenvolvimento com IA

Este arquivo é a fonte principal de regras para qualquer assistente de IA que altere este repositório.

## Contexto técnico

- Aplicativo: Filmae
- Framework: Expo SDK 57 com React Native e Expo Router
- Linguagem: TypeScript em modo estrito
- Plataformas: Android, iOS e Web
- Gerenciador de pacotes: npm
- Diretório das rotas: `src/app`

Antes de usar uma API do Expo, consulte a documentação correspondente à versão 57:

`https://docs.expo.dev/versions/v57.0.0/`

## Comandos obrigatórios

Execute na raiz do projeto `filmae`:

```bash
npm run format
npm run check
```

Uma tarefa só está concluída quando TypeScript, ESLint e Prettier terminarem sem erros.

## Organização do código

```text
src/
├── app/          # Telas e layouts do Expo Router
├── components/   # Componentes reutilizáveis
├── config/       # Variáveis e configurações do aplicativo
├── hooks/        # Hooks personalizados
├── services/     # API, armazenamento e integrações externas
├── theme/        # Cores, espaçamentos, tipografia e tokens visuais
├── types/        # Tipos compartilhados
└── utils/        # Funções puras e utilitários
```

- Arquivos dentro de `src/app` devem representar somente rotas, layouts ou arquivos especiais do Expo Router.
- Não coloque chamadas HTTP diretamente nas telas.
- Toda comunicação HTTP deve usar exclusivamente a instância `api` exportada por `@/services/api`.
- Não importe `axios` diretamente fora de `src/services/api.ts`.
- Telas devem chamar serviços do domínio, como `authService`, e nunca montar URLs ou requisições diretamente.
- Cada domínio deve possuir seu próprio arquivo em `src/services`, como `auth.service.ts` ou `movies.service.ts`.
- A URL do backend deve vir de `EXPO_PUBLIC_API_URL`.
- Nunca escreva endereços locais, de homologação ou de produção diretamente no código.
- Extraia um componente quando ele for reutilizado ou quando deixar a tela mais simples.
- Não crie abstrações para código usado uma única vez sem ganho claro de leitura.

## Convenções

- Componentes e tipos: `PascalCase`.
- Funções, variáveis e hooks: `camelCase`.
- Constantes globais: `UPPER_SNAKE_CASE`.
- Hooks personalizados devem começar com `use`.
- Componentes React devem usar exportação padrão somente quando forem telas do Expo Router.
- Demais componentes e utilitários devem preferir exportações nomeadas.
- Não use `any`. Crie um tipo adequado ou use `unknown` com validação.
- Não deixe imports, variáveis ou estilos sem uso.
- Não silencie erros de TypeScript ou ESLint sem explicar o motivo em comentário.

## React e React Native

- Use componentes funcionais e hooks.
- Hooks nunca devem ser chamados dentro de condições, repetições ou funções internas.
- Use `Pressable` para interações.
- Forneça `accessibilityRole` e `accessibilityLabel` quando o texto não explicar a ação.
- Formulários devem definir corretamente `keyboardType`, `autoCapitalize`, `autoCorrect` e `secureTextEntry`.
- Listas extensas devem usar `FlatList` ou `SectionList`.
- Não execute efeitos colaterais durante a renderização.

## Estilização

- Use `StyleSheet.create`.
- Cores, espaçamentos, raios, tamanhos e tipografia compartilhados devem vir de `@/theme`.
- Não adicione cores hexadecimais diretamente nas telas quando existir um token equivalente.
- Estilos responsivos derivados de largura ou altura devem usar `useMemo` quando criarem objetos.
- Preserve acessibilidade, contraste e áreas de toque adequadas.

## Navegação

- Use Expo Router e rotas tipadas.
- Novas telas devem ser criadas dentro de `src/app`.
- Não renomeie uma rota existente sem atualizar todas as navegações relacionadas.
- `_layout.tsx` configura a navegação e não deve conter regra de negócio.

## API e ambientes

- A única instância HTTP permitida é `api`, localizada em `src/services/api.ts`.
- A URL base deve ser lida de `EXPO_PUBLIC_API_URL`.
- O timeout deve ser lido de `EXPO_PUBLIC_API_TIMEOUT_MS`.
- Telas nunca devem importar Axios diretamente.
- Telas devem chamar funções de serviços.
- Serviços devem retornar dados tipados.
- Não invente endpoints, payloads ou formatos de resposta.
- Trate carregamento, sucesso, vazio e erro.
- Não registre senhas, tokens ou dados pessoais no console.

## Segurança

- Nunca coloque senhas, tokens ou chaves privadas no código.
- Variáveis públicas do Expo devem usar o prefixo `EXPO_PUBLIC_`.
- Variáveis `EXPO_PUBLIC_` não podem guardar segredos.
- Tokens de autenticação não devem ser guardados no tema, na URL ou em variáveis públicas.

## Forma de entrega

- Informe todos os arquivos criados, alterados e removidos.
- Quando o usuário pedir código para copiar, entregue o conteúdo completo de cada arquivo.
- Nunca use trechos como `...`, “restante igual” ou código incompleto.
- Informe comandos de instalação quando houver mudança em dependências.
