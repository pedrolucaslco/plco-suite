Quero criar um aplicativo pwa, mobile first, offline first, que vai ter role de usuarios

admin - gerencia sistema com crm, analytics, pagamentos, etc
user - usuario do sistema
   - pode ser atribuido como pai de outro user, mãe de outro useer, reponsável de outro user
usuarios vão ser pais, mães, ou casal de marrido e mulher, fihlos


a ideia é criar um aplicativo de gerenciamento da casa, pq um app de tarefas costuma focar muito no eu, em uma pessoa só e como ela se organiza em torno dela própria. a proposta desse app é pra que todos se organizem como uma família, inclusive levando em conta uma família que o filho casou, e construiu outra familia, poderá ser criado outro nucleo familiar e o usuario filho casado pode ter acesso aos dois nucleos e permitir ver o que tem de cada um.

a ideia é ter:
- tarefas
- calendário
- anotações compartilhadas
- multiplos nucleos familiar
- sincronização 

primeiro passo para POC, é ter criação de um nucleo e dentro desse nucleo começar a construir tarefas

inspirações:
- https://ticktick.com/
- https://www.todoist.com/pt-BR
- https://capacities.io/
- principal de design: https://culturedcode.com/things/

gosto da ideia de ter as seções
inbox
hoje
em breve
qualquer hora
algum dia

quero a maioria das funcionalidades dessa inspiração
https://culturedcode.com/things/features/

quero a filosofia de tarefas dessa inspiração
https://culturedcode.com/things/support/articles/6378414/
a ideia de projetos dentro de áreas
as seções, etc.

quero alguma forma de api pra fazer depois atalhos no ios para usar no iphone



tarefas
projetos
notas
calendario
arquivos (imagens, pdfs)

admin
- auditoria de ações do usuario, de forma anonima mas suficiente pra entender o que os usuarios mais usam, fazem e processar melhorias a fazer.
- analytics de uso geral

landing page de acordo com as inspirações, focado em vender como a solução para organização não egoista e focada no lar.

planos tem algumas ideias aqui mas no geral quero closed source, mas gratuito.

- projetos
  - tarefas
  - notas
- tudo pode ser visto em calendario




Esquema de auditorias: usuário criou x tarefas, clicou em tal botão (JSON estilo EasySchool) — tracking de uso dentro do app


Montar um app que seja auto sustentável (com ERP, CRM, landing page etc.) — visão maior de produto que tangencia o household

ver roadmap household — tinha data para hoje (06/06)



Procurar como fazer um onboarding rápido de pwa — relevante para distribuição do app



"app para slow living and household"

A ideia é reunir tudo e montar um app de household. A família pode se conectar — pais e filhos — pra saber chores, tarefas, anotações compartilhadas, documentos com fácil acesso, bug report fácil, feedbacks. Modelo: 3 meses por R$1, depois R$5/mês, ou pagamento único com atualizações por 1 ano. Roles de usuários, TV display chores board, notificações, calendário — tudo pra família se organizar como um todo.


a estrutura do projeto precisa seer assim:

/ - raiz do projeto, landing page focada em vendas
/app - app de fato
/admin - analytics e dados administrativos gerais

depois quero expandir pra /blog mas agora não.
