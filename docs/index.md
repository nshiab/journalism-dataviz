**Journalism Dataviz v1.0.30**

***

# The Journalism Library (dataviz)

Useful TypeScript functions for data visualization in journalism projects.
Part of the [journalism library](https://github.com/nshiab/journalism).

The library is maintained by [Nael Shiab](https://naelshiab.com/), computational
journalist and senior data producer for [CBC News](https://www.cbc.ca/news).

> [!TIP]
> To learn how to use this library and more, check out
> [Code Like a Journalist](https://www.code-like-a-journalist.com/), a free and
> open-source data analysis and data visualization course in TypeScript. You
> might also find
> [simple-data-analysis](https://github.com/nshiab/simple-data-analysis) useful.

## Installation

```sh
npm install @nshiab/journalism-dataviz
```

```ts
import { logBarChart } from "@nshiab/journalism-dataviz";

logBarChart(
  [
    { country: "Canada", count: 40 },
    { country: "France", count: 25 },
  ],
  "country",
  "count",
);
```

To start a data project with folders, configuration and documentation for AI
agents, run:

```sh
npx @nshiab/setup-data-project
```

## Browser use

For browser projects, use the `/web` entry point with a browser bundler.

```ts
import { rewind } from "@nshiab/journalism-dataviz/web";

const polygon = {
  type: "Polygon",
  coordinates: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
    ],
  ],
};
const rewound = rewind(polygon);
```

## Documentation

- [Documentation](https://nshiab.github.io/journalism-dataviz/)
- [llms.txt — Documentation index for AI agents](https://nshiab.github.io/journalism-dataviz/llms.txt)
- [llm.md — Complete Markdown reference](https://nshiab.github.io/journalism-dataviz/llm.md),
  for AI assistants or offline reading
- [npm package](https://www.npmjs.com/package/@nshiab/journalism-dataviz)

See
[CONTRIBUTING.md](https://github.com/nshiab/journalism-dataviz/blob/main/CONTRIBUTING.md)
for development commands.
