/** @format */

// ===========================================================================
//                  INITIALIZE CANVAS AND ENGINE
//============================================================================
const {
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  Body,
  Events,
  MouseConstraint,
  Mouse,
} = Matter;

//canvas size
const width = window.innerWidth;
const height = window.innerHeight;

//maze size
const gridRows = 10;
const gridColumns = 10;

const uH = height / gridRows;
const uW = width / gridColumns;

const lineThickness = 10;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Mouse click and drag functionality
World.add(
  world,
  MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas),
  })
);

// ===========================================================================
//                  MAZE GENERATION
//============================================================================
//Walls/boundaries
const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
];
World.add(world, walls);

//randomize maze order function
const shuffle = (arr) => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter--;
    [arr[counter], arr[index]] = [arr[index], arr[counter]];
  }
  return arr;
};

//Maze generation
const grid = Array(gridRows)
  .fill(null)
  .map(() => Array(gridColumns).fill(false));

const verticals = Array(gridRows)
  .fill(null)
  .map(() => Array(gridColumns - 1).fill(false));

const horizontals = Array(gridRows - 1)
  .fill(null)
  .map(() => Array(gridColumns).fill(false));

//pick random starting location
const startRow = Math.floor(Math.random() * gridRows);
const startColumn = Math.floor(Math.random() * gridColumns);

//maze path generation
const traverse = (row, column) => {
  console.log(row, column);
  //check if visited the cell then return
  if (grid[row][column] === true) {
    return;
  }

  //Mark cell as visited
  grid[row][column] = true;

  //Assemble ransom-ordered list of neighbors
  const neighbors = shuffle([
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"],
  ]);
  //for each neighbor
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;

    //check if out-of-bounds or
    if (
      nextRow < 0 ||
      nextRow >= gridRows ||
      nextColumn < 0 ||
      nextColumn >= gridColumns ||
      //if we have visited neighbor then continue to next neighbor
      grid[nextRow][nextColumn]
    ) {
      continue;
    }

    //remove wall from either horizontal or vertical
    if (direction === "left") {
      verticals[row][column - 1] = true;
    } else if (direction === "right") {
      verticals[row][column] = true;
    } else if (direction === "up") {
      horizontals[row - 1][column] = true;
    } else {
      horizontals[row][column] = true;
    }

    //visit next cell
    traverse(nextRow, nextColumn);
  }
};

traverse(startRow, startColumn);

//draw horizontal boundaries
horizontals.forEach((row, r) => {
  row.forEach((open, c) => {
    if (open) return;
    const wall = Bodies.rectangle(
      c * uW + uW / 2,
      uH * (r + 1),
      uW + lineThickness,
      lineThickness,
      {
        isStatic: true,
        label: "wall",
        render: {
          fillStyle: "red",
        },
      }
    );
    World.add(world, wall);
  });
});

//draw vertical boundaries
verticals.forEach((row, r) => {
  row.forEach((open, c) => {
    if (open) return;
    const wall = Bodies.rectangle(
      uW * (c + 1),
      r * uH + uH / 2,
      lineThickness,
      uH + lineThickness,
      {
        isStatic: true,
        label: "wall",
        render: {
          fillStyle: "red",
        },
      }
    );
    World.add(world, wall);
  });
});

// ===========================================================================
//                  RETICULATING SPLINES
//============================================================================
const goal = Bodies.rectangle(
  width - uW / 2,
  height - uH / 2,
  uW * 0.7,
  uH * 0.7,
  {
    isStatic: true,
    label: "goal",
    render: {
      fillStyle: "green",
    },
  }
);

World.add(world, goal);

const ball = Bodies.circle(uW / 2, uH / 2, uH > uW ? uW / 4 : uH / 4, {
  label: "ball",
  render: {
    fillStyle: "white",
  },
});

World.add(world, ball);

// ===========================================================================
//                  PLAYER CONTROLS
//============================================================================
document.addEventListener("keydown", (e) => {
  const { x, y } = ball.velocity;
  if (e.keyCode === 87 || e.keyCode === 38) {
    Body.setVelocity(ball, { x, y: y - 5 });
  }
  if (e.keyCode === 68 || e.keyCode === 39) {
    Body.setVelocity(ball, { x: x + 5, y });
  }
  if (e.keyCode === 65 || e.keyCode === 37) {
    Body.setVelocity(ball, { x: x - 5, y });
  }
  if (e.keyCode === 83 || e.keyCode === 40) {
    Body.setVelocity(ball, { x, y: y + 5 });
  }
});

// ===========================================================================
//                  WIN CONDITIONS
//============================================================================
Events.on(engine, "collisionStart", (e) => {
  e.pairs.forEach((collision) => {
    const labels = ["ball", "goal"];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      win();
    }
  });
});

const win = function () {
  console.log("user won!");
  document.querySelector(".winner").classList.remove("hidden");
  world.gravity.y = 1;
  world.bodies.forEach((body) => {
    if (body.label === "wall") Body.setStatic(body, false);
  });
};
