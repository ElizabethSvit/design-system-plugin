## Плагин для автоматизации дизайн-системы в Figma с монорепой

### Как запустить плагин

1. Запустить `yarn` для установки зависимостей.
2. Запустить `yarn build:watch` для старта вебпака в watch mode.
3. Открыть десктопное приложение `Figma` -> `Plugins` -> `Development` -> `New Plugin...` и выбрать `manifest.json` файл из этого репозитория.

### Что делает плагин

Плагин открывает диалоговое окно с конфигом для гитхаба и кнопкой "Отправить", по нажатию на которую происходит сбор нужных стилей с текущей страницы, создание коммита в head-ветку в .json файл со стилями и создание пул реквеста с изменениями, а если он уже есть, то добавления коммита в текущий.
В конфиге есть следующие поля:
- `repoPath` — путь до репозитория, в который будет выкачиваться файл со стилями,
- `token` — личный токен, который можно получить [таким образом](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token),
- `committerName`, `committerEmail` — авторизационные данные,
- `headBranch` — ветка, в которую произойдет коммит стилей,
- `baseBranch` — ветка, в которую произойдет пул реквест

После первого ввода они закешируются и будут введены в поля автоматически при следующем открытии плагина.

На данном этапе плагин обрабатывает следующие стили существующей дизайн-системы:

- Типографику — собирает Text Styles со страницы с нужными свойствами в формате

```
{
  "RBO / Large Title": {
    "fontName": {
      "family": "Proxima Nova",
      "style": "Bold"
    },
    "fontSize": 30,
    "textCase": "ORIGINAL",
    "textDecoration": "NONE",
    "letterSpacing": {
      "unit": "PIXELS",
      "value": -0.30000001192092896
    },
    "lineHeight": {
      "unit": "PIXELS",
      "value": 34
    }
  }, ...
}
```

- Иконки — собирает иконки в формате SVG в формате

```
{
  "name": "Vector",
  "path": [
    {
      "windingRule": "EVENODD",
      "data": "M 10.99997615814209 13.579999923706055 C 8.129976272583008 ..."
    },
    {
      "windingRule": "EVENODD",
      "data": "M 9.100000381469727 15.080078125 L 12.899999618530273 ..."
    }
  ],
  "paints": [
    {
      "type": "SOLID",
      "visible": true,
      "opacity": 1,
      "blendMode": "NORMAL",
      "color": "#ffcc1b"
    }
  ],
  "width": 22,
  "height": 24.080078125
}
```

- Цвета — собирает цвета из дизайн-системы в формате

```
{
  "color-button-primary": {
      "paints": [
        {
          "type": "SOLID",
          "visible": true,
          "opacity": 1,
          "blendMode": "NORMAL",
          "color": "#ffcc1b"
        }
      ]
    }
  }, ...
}
```

Плагин также может поддержать сетки и отступы в будущем, после доработки файлов дизайн системы в Фигме.

### Как изменить плагин
- Изменить UI можно в [App.tsx](./src/app/components/App.tsx).  
- Взаимодействовать с Figma API можно в [controller.ts](./src/plugin/controller.ts).  

### Используемые инструменты
- React + Webpack
- TypeScript
- Prettier precommit hook

### Дополнительные материалы

- [Figma plugin documentation](https://www.figma.com/plugin-docs/how-plugins-run/)
- [Figma Nodes documentation](https://www.figma.com/plugin-docs/api/nodes/)
- [Figma network requests](https://www.figma.com/plugin-docs/making-network-requests/)
- [Github API](https://docs.github.com/en/free-pro-team@latest/rest)

