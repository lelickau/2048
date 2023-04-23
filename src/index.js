import Grid from './modules/Grid/Grid'
import Tile from './modules/Tile/Tile'

const gameBoard = document.getElementById('game-board')

let grid = new Grid(gameBoard)
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard))
grid.getRandomEmptyCell().linkTile(new Tile(gameBoard))
setupInputOnce()
let tryes = 0
let accaunt = 0

// fullscrin
const d = document.querySelector('.fullscrin')
console.log(d)
d.addEventListener(
  "click",
  (e) => {
    console.log('object')
    toggleFullScreen()
  },
  false
)

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

// repeat
const repeat = document.querySelector('.repeat')
repeat.addEventListener('click', (e) => {
  gameBoard.innerHTML = ''
  grid = new Grid(gameBoard)
  grid.getRandomEmptyCell().linkTile(new Tile(gameBoard))
  grid.getRandomEmptyCell().linkTile(new Tile(gameBoard))
  setupInputOnce()
  tryes = 0
  accaunt = 0
  const t = document.querySelector('.tryes')
  const a = document.querySelector('.accaunt')
  t.innerHTML = 0
  a.innerHTML = 0
})


function setupInputOnce () {
  window.addEventListener('keydown', handleInput, { once: true })
}

async function handleInput (e) {
    switch (e.key) {
      case 'ArrowUp':
        if (!canMoveUp()) {
          setupInputOnce()
          return
        }
        await moveUp()
        break;

      case 'ArrowDown':
        if (!canMoveDown()) {
          setupInputOnce()
          return
        }
        await moveDown()
        break;

      case 'ArrowLeft':
        if (!canMoveLeft()) {
          setupInputOnce()
          return
        }
        await moveLeft()
        break;

      case 'ArrowRight':
        if (!canMoveRight()) {
          setupInputOnce()
          return
        }
        await moveRight()
        break;
    
      default:
        setupInputOnce();
        return
    }

    const newTile = new Tile(gameBoard);
    grid.getRandomEmptyCell().linkTile(newTile);

    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
      await newTile.waitForAnimationEnd()
      // end 
      alert(`Количество попыток ${tryes}. Попытаться снова?`)
      gameBoard.innerHTML = ''
      grid = new Grid(gameBoard)
      grid.getRandomEmptyCell().linkTile(new Tile(gameBoard))
      grid.getRandomEmptyCell().linkTile(new Tile(gameBoard))
      setupInputOnce()
      return
    }

    setupInputOnce()
  }

async function moveUp() {
  await slideTiles(grid.cellGroupedByColumn)
}

async function moveDown() {
  await slideTiles(grid.cellGroupedByReversedColumn)
}

async function moveLeft() {
  await slideTiles(grid.cellGroupedByRow)
}

async function moveRight() {
  await slideTiles(grid.cellGroupedByReversedRow)
}

async function slideTiles (groupedCells) {
  tryes += 1
  const t = document.querySelector('.tryes')
  t.innerHTML = tryes
  const promises = []
  groupedCells.forEach((group) => slideTilesInGroup(group, promises));

  await Promise.all(promises);

  grid.cells.forEach((cell) => {
    cell.hasTileForMerge() && cell.mergeTiles()
  })
}

function slideTilesInGroup (group, promises) {
  for (let i = 1; i < group.length; i += 1) {
    if (group[i].isEmpty()) {
      continue;
    }
     const cellWithTile = group[i]

     let targetCell;
     let j = i - 1
     
     while (j >= 0 && group[j].canAccept(cellWithTile.linkedTile)) {
      targetCell = group[j]
      j--
     }

     if (!targetCell) {
      continue
     }

     promises.push(cellWithTile.linkedTile.waitForTransitionEnd())

     if (targetCell.isEmpty()) {
      targetCell.linkTile(cellWithTile.linkedTile)
     }else {
      //
      accaunt += 10
      const a = document.querySelector('.accaunt')
      a.innerHTML = accaunt
      targetCell.linkTileForMerge(cellWithTile.linkedTile)
     }

     cellWithTile.unlinkTile()
  }
}

function canMoveUp() {
  return canMove(grid.cellGroupedByColumn)
}
function canMoveDown() {
  return canMove(grid.cellGroupedByReversedColumn)
}
function canMoveLeft() {
  return canMove(grid.cellGroupedByRow)
}
function canMoveRight() {
  return canMove(grid.cellGroupedByReversedRow)
}

function canMove(groupedCells) {
  return groupedCells.some((group) => canMoveInGroup(group))
}

function canMoveInGroup(group) {
  return group.some((cell, index) => {
    if (index === 0) {
      return false
    }

    if (cell.isEmpty()) {
      return false
    }

    const targetCell = group[index - 1]
    return targetCell.canAccept(cell.linkedTile)
  })
}

const myMobile = {
  Android: function() {
      return navigator.userAgent.match(/Android/i)
  },
  BlackBerry: function() {
      return navigator.userAgent.match(/BlackBerry/i)
  },
  iOS: function() {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i)
  },
  Opera: function() {
      return navigator.userAgent.match(/Opera Mini/i)
  },
  Windows: function() {
      return navigator.userAgent.match(/IEMobile/i)
  },
  any: function() {
      return (myMobile.Android() || 
              myMobile.BlackBerry() || 
              myMobile.iOS() || 
              myMobile.Opera() || 
              myMobile.Windows())
  }
}

if(myMobile.any()) {
  document.querySelector('.navigate').style.display = 'none'
}