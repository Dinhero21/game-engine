# Game Engine

A Fully Open Source Game and Game Engine written in [TypeScript](https://typescriptlang.org/).

[nodejs](https://nodejs.org/) for backend.

[Socket.IO](https://socket.io/) for API.

[Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) for client-side rendering.

## Installing

1. Download code via `Code > Download ZIP` and *unzip* or `git clone https://github.com/Dinhero21/game-engine` via command line.
2. Open directory. (should be named `game-engine`)
3. Run `npm i` (or `npm i --dev` for development).
4. Run `npm start` (or `npm run start`) (or `npm run watch` for development).
5. Open `localhost:8080` (or the port configured in `PORT` environmental variable).

## Contributing

There are many ways you contribute, here are some of them.

1. Request a feature by writing a comment [here](https://github.com/Dinhero21/game-engine/issues/1).
2. Submit bugs by creating a new issue [here](https://github.com/Dinhero21/game-engine/issues/).

## Modding

There is currently no mod support but you can always [create a fork](https://github.com/Dinhero21/game-engine/fork) and implement your own features.

## Documentation

There currently is no documentation.

## Performance

### Server-side

The server will warn you via the console when a `tick` takes longer than the tick rate (12tps by default).

### Client-side

When the game is initialized a global variable called `GamePerformance` is created that can be accessed via `window.GamePerformance`

To see how many times per second `draw` is being called run the expression `1 / window.GamePerformance.averageDrawDelta`

To see how many times per second `update` is being called run the expression `1 / window.GamePerformance.averageUpdateDelta`

To see how many times per second `draw` could be *theoretically* called run the expression `1 / window.GamePerformance.averageDrawTime`

To see how many times per second `update` could be *theoretically* called run the expression `1 / window.GamePerformance.averageUpdateTime`

Tip: Use [Live Expressions](https://developer.chrome.com/docs/devtools/console/live-expressions/) to see the values update in real-time.
