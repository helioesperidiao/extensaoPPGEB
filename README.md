# Quiz Interativo — Extensão PPGEB

Aplicação web de perguntas e respostas sobre prevenção de doenças que podem ser transmitidas entre animais e pessoas. O projeto foi desenvolvido para a disciplina de Extensão em Pós-Graduação de Engenharia Biomédica.

## Funcionalidades

- Perguntas com uma ou várias respostas corretas.
- Imagens relacionadas às perguntas, com visualização ampliada.
- Pontuação, feedback imediato e tela de resultado.
- Temporizador configurável por pergunta.
- Leitura das perguntas e respostas usando a síntese de voz do navegador.
- Configurações de voz, velocidade, tom e volume, além de efeitos sonoros.
- Preferências salvas no armazenamento local do navegador.
- Layout responsivo.

## Como executar

O projeto não precisa de instalação de dependências nem de etapa de build. Como a aplicação carrega arquivos JSON com `fetch`, ela deve ser aberta por um servidor HTTP local, e não diretamente pelo arquivo `index.html`.

Com Python instalado, abra o terminal na pasta do projeto e execute:

```powershell
python -m http.server 8000
```

Depois, acesse [http://localhost:8000](http://localhost:8000) no navegador. Para encerrar o servidor, pressione `Ctrl+C` no terminal.

Também é possível publicar os arquivos em qualquer serviço de hospedagem de sites estáticos, mantendo a estrutura de pastas.

## Conteúdo do projeto

```text
.
├── index.html
├── questoes.json
├── sobre.json
├── logo.png
├── css/                 # Estilos da interface
├── img/                 # Imagens das perguntas (image1.png, image2.png...)
├── js/                  # Lógica do quiz, áudio, voz, timer e configurações
└── context.py           # Utilitário para gerar conteudo_projeto.txt
```

## Editar as perguntas

As perguntas são carregadas de `questoes.json`. O arquivo deve conter uma propriedade `questions`; cada item pode ter:

| Propriedade | Descrição |
| --- | --- |
| `question` | Texto do enunciado. |
| `options` | Lista de alternativas. |
| `correct` | Índice da alternativa correta, começando em `0`, ou uma lista de índices para perguntas com várias respostas corretas. |

Exemplo:

```json
{
  "questions": [
    {
      "question": "Qual alternativa está correta?",
      "options": ["Primeira opção", "Segunda opção"],
      "correct": 1
    },
    {
      "question": "Quais alternativas estão corretas?",
      "options": ["Opção A", "Opção B", "Opção C"],
      "correct": [0, 2]
    }
  ]
}
```

Os índices em `correct` seguem a ordem das alternativas e começam em zero. A aplicação associa imagens às perguntas pela posição: a primeira pergunta usa `img/image1.png`, a segunda usa `img/image2.png` e assim por diante. Se não houver imagem correspondente, o quiz continua sem exibi-la.

## Editar as informações do projeto

O arquivo `sobre.json` fornece os dados exibidos na janela “Sobre”: título, descrição, professor, alunos, links e texto do rodapé. Os campos de links podem ser deixados vazios quando não forem aplicáveis.

## Observações

- A disponibilidade de vozes em português depende do navegador e das vozes instaladas no dispositivo.
- As preferências de som e configuração ficam no `localStorage` do navegador e podem ser diferentes em cada dispositivo ou navegador.
