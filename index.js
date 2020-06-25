/** @format */

const { Engine, Render, Runner, World, Bodies } = Matter;

//canvas size
const width = 600;
const height = 600;

//maze size
const gridRows = 5;
const gridColumns = 5;

const uH = height / gridRows;
const uW = width / gridColumns;

const lineThickness = 10;

const engine = Engine.create();
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

//Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 40, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 40, height, { isStatic: true }),
];

World.add(world, walls);

//randomize maze order
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

const startRow = Math.floor(Math.random() * gridRows);
const startColumn = Math.floor(Math.random() * gridColumns);

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
console.log(horizontals);
console.log(verticals);
console.log(grid);

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
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, r) => {
  row.forEach((open, c) => {
    if (open) return;
    const wall = Bodies.rectangle(
      uH * (c + 1),
      r * uH + uH / 2,
      lineThickness,
      uH + lineThickness,
      {
        isStatic: true,
      }
    );
    World.add(world, wall);
  });
});
