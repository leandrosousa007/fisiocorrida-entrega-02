# FisioCorrida

Aplicativo acadêmico de fisioterapia para corredores, feito com React Native e Expo.

## Como rodar

Com Node.js 24 e npm instalados, execute na pasta do projeto:

```sh
npm install
npm start
```

No celular, abra o Expo Go compatível com o SDK 58 e leia o QR code mostrado no terminal. Mantenha o computador e o celular na mesma rede Wi-Fi e o terminal aberto durante o uso. Após atualizar o código, use `npm ci` e `npm start -- --clear` na pasta do projeto para descartar o bundle anterior. Para testar no navegador, use `npm run web`.

Na tela de login, escolha um dos três pacientes ou um dos dois fisioterapeutas em **Contas de demonstração** e toque em **Entrar**. Para ver o acompanhamento de Lucas e Ana, entre como Rafaela. Use o mesmo aparelho para alternar entre os perfis. Os dados fictícios ficam salvos localmente.

| Perfil | E-mail de demonstração |
| --- | --- |
| Rafaela (fisioterapeuta) | `rafaela@gmail.com` |
| Bruno (fisioterapeuta) | `bruno@gmail.com` |
| Lucas (paciente) | `lucas@gmail.com` |
| Ana (paciente) | `ana@gmail.com` |
| Marina (paciente) | `marina@gmail.com` |

A senha dos cinco perfis é `senha123`. Esses acessos são internos ao aplicativo de demonstração.

## Estrutura do projeto

### Arquivos da raiz

| Arquivo | O que faz |
| --- | --- |
| [`App.jsx`](App.jsx) | Organiza as telas, a navegação e os formulários. Chama os métodos de `src/modelo.js` para executar as ações. |
| [`index.js`](index.js) | Registra o componente `App` para o Expo iniciar o aplicativo. |
| [`app.json`](app.json) | Configura o nome do app, a versão e os identificadores de Android e iOS. |
| [`package.json`](package.json) | Lista as dependências e define comandos como `npm start` e `npm run web`. |
| [`package-lock.json`](package-lock.json) | Registra as versões exatas das dependências instaladas. |
| [`.gitignore`](.gitignore) | Define quais arquivos locais ficam fora do Git, como `node_modules`. |
| [`README.md`](README.md) | Explica como rodar o app, quais contas testar e onde encontrar o código. |

### Pasta `src/`

| Arquivo | O que faz |
| --- | --- |
| [`modelo.js`](src/modelo.js) | A classe `Clinica` concentra as regras de negócio: autenticação, vínculo entre paciente e fisioterapeuta, versões dos planos, registro de sessões e armazenamento local. |
| [`entidades.js`](src/entidades.js) | Define as classes do diagrama UML, como `Paciente`, `Plano`, `Sessao` e `Realiza`. `Realiza` guarda a conclusão e a observação de cada exercício da sessão. |
| [`demonstracao.js`](src/demonstracao.js) | Prepara as contas, os exercícios, os relatos, os planos e as sessões fictícias. |
| [`interface.jsx`](src/interface.jsx) | Reúne componentes reutilizáveis, como botões, campos, escala de dor e barra de navegação. |
| [`cartoes.jsx`](src/cartoes.jsx) | Monta cartões de exercícios e sessões, com a dor antes e depois e as observações por exercício. |
| [`perfis.js`](src/perfis.js) | Define os perfis `Paciente` e `Fisioterapeuta`. |

Por exemplo, ao tocar em **Salvar sessão**, `App.jsx` chama `registrarSessao()` em `modelo.js`. O método valida os dados e salva a sessão. `cartoes.jsx` exibe o registro no histórico.
