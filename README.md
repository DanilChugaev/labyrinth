# Labyrinth game

A labyrinth game where each level is unique

[PLAY HERE](https://danilchugaev.github.io/labyrinth/)

##  Features

- Procedural Labyrinth Generation: Every level creates a new, unique maze using algorithms for endless replayability
- Controls: Use arrow keys `(↑ ← ↓ →)` to move the player through the labyrinth
- Levels and Difficulty: Progress through levels with increasing complexity
- Responsive Design: Works on desktop and mobile browsers
- PWA: It works even without the Internet

## Run Locally

Clone the project

```bash
  git clone git@github.com:DanilChugaev/labyrinth.git
```

Go to the project directory

```bash
  cd labyrinth
```

Install dependencies

```bash
  yarn install
```

Start the development server

```bash
  yarn dev
```

Open http://localhost:5173/labyrinth/ in your browser (note: the /labyrinth/ base path is for GitHub Pages; adjust if needed locally)

## Lint project

To lint code in project

```bash
 yarn lint:fix
```

## Build For Production

To generate production build

```bash
 yarn build
```

Preview build

```bash
 yarn preview
```

## Deployment

This project is deployed to GitHub Pages using GitHub Actions. See `.github/workflows/deploy.yml` for the workflow configuration

## Technologies Used

- TypeScript: For type-safe JavaScript
- Vite: Fast build tool and dev server
- ESLint & Prettier: For code linting and formatting
- Web Workers: Used for maze generation to avoid blocking the UI thread

## Contributing

Contributions are welcome! Fork the repository, create a branch, and submit a pull request

- Fork the project
- Create your feature branch (git checkout -b feature/AmazingFeature)
- Commit your changes (git commit -m 'Add some AmazingFeature')
- Push to the branch (git push origin feature/AmazingFeature)
- Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/DanilChugaev/labyrinth/blob/master/LICENSE) file for details
