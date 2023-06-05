import Grid from './modules/Grid/Grid'
import Tile from './modules/Tile/Tile'

const gameBoard = document.getElementById("game-board")
let tryes = 0
let accaunt = 0

let grid = new Grid(gameBoard)
grid.getRandomEmptyCell()
  .linkTile(new Tile(gameBoard))
grid.getRandomEmptyCell()
  .linkTile(new Tile(gameBoard))
setupInput()


function setupInput() {
  window.addEventListener("keydown", handleKeydown, { once: true })
  window.addEventListener("touchstart", handleTouchStart, { once: true, passive: false })
}

function stopInput() {
  window.removeEventListener("keydown", handleKeydown)
  window.removeEventListener("touchstart", handleTouchStart)
}

function handleKeydown(e) {
  handleInput(e.key)
}

async function handleInput(key) {
  stopInput()

  switch (key) {
    case "ArrowUp":
      if (!canMoveUp()) {
        setupInput()
        return
      }
      await moveUp()
      break
    case "ArrowDown":
      if (!canMoveDown()) {
        setupInput()
        return
      }
      await moveDown()
      break
    case "ArrowLeft":
      if (!canMoveLeft()) {
        setupInput()
        return
      }
      await moveLeft()
      break
    case "ArrowRight":
      if (!canMoveRight()) {
        setupInput()
        return
      }
      await moveRight()
      break
    default:
      setupInput()
      return
  }

  grid.cells.forEach(cell => cell.mergeTiles())

  const newTile = new Tile(gameBoard)
  grid.getRandomEmptyCell().linkTile(newTile)

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForAnimationEnd()
      .then(() => {
        const modal = document.querySelector('.finish')
        const btnRepeat = document.querySelector('.finish__modal-btn')
        const content = document.querySelector('.finish__modal-text')
        modal.classList.remove('hidden')
        content.innerHTML = `Сделано ходов: ${tryes}. Заработано очков: ${accaunt}`
        btnRepeat.addEventListener('click', () => {
          modal.classList.add('hidden')
          resetGrid()
        })
      })
    return
  }

  setupInput()
}

function moveUp() {
  slideTiles(grid.cellsGroupedByColumn)
}

function moveDown() {
  slideTiles(
    grid.cellsGroupedByColumn
      .map(column => [...column].reverse())
  )
}

function moveLeft() {
  slideTiles(grid.cellsGroupedByRow)
}

function moveRight() {
  slideTiles(grid.cellsGroupedByRow.map(raw => [...raw].reverse()))
}

function slideTiles(groupedCells) {
  tryes += 1
  const t = document.querySelector('.tryes')
  t.innerHTML = tryes

  const promises = []

  groupedCells.forEach(group => {
    for (let i = 1; i < group.length; i++) {
      const cell = group[i]

      if (!cell.hasLinkedTile()) {
        continue
      }

      let targetCell

      for (let j = i - 1; j >= 0; j--) {
        const temporaryTargetCell = group[j]

        if (!temporaryTargetCell.canAccept(cell.linkedTile)) {
          break
        }

        targetCell = temporaryTargetCell
      }

      if (!!targetCell) {
        promises.push(cell.linkedTile.waitForTransitionEnd())

        if (targetCell.linkedTile != null) {
          targetCell.linkTileForMerge(cell.linkedTile)
        } else {
          accaunt += 10
          const a = document.querySelector('.accaunt')
          a.innerHTML = accaunt

          targetCell.linkTile(cell.linkedTile)
        }

        cell.unlinkTile()
      }
    }
  })

  return Promise.all(promises)
}

function canMoveUp() {
  return canMove(grid.cellsGroupedByColumn)
}

function canMoveDown() {
  return canMove(grid.cellsGroupedByColumn.map(column => [...column].reverse()))
}

function canMoveLeft() {
  return canMove(grid.cellsGroupedByRow)
}

function canMoveRight() {
  return canMove(grid.cellsGroupedByRow.map(raw => [...raw].reverse()))
}

function canMove(groupedCells) {
  return groupedCells.some(group => {
    return group.some((cell, index) => {
      if (index === 0) {
        return false
      }

      if (cell.linkedTile == null) {
        return false
      }

      const targetCell = group[index - 1]
      return targetCell.canAccept(cell.linkedTile)
    })
  })
}

function handleTouchStart(e) {
  stopInput()
  e.preventDefault()

  let touchStartData = e.changedTouches[0]
  let touchStartDate = new Date

  window.addEventListener("touchend", async evt => {
    evt.preventDefault()
    let touchEndData = evt.changedTouches[0]

    if (new Date - touchStartDate > 500) {
      setupInput()
      return
    }

    let deltaX = touchEndData.pageX - touchStartData.pageX
    let deltaY = touchEndData.pageY - touchStartData.pageY

    if (Math.abs(deltaX) >= 55) {
      await handleInput(deltaX > 0 ? "ArrowRight" : "ArrowLeft")
    } else if (Math.abs(deltaY) >= 55) {
      await handleInput(deltaY > 0 ? "ArrowDown" : "ArrowUp")
    }
    setupInput()
  }, { once: true })
}

// fullscrin
const fullscrBtn = document.querySelector('.fullscrin')

fullscrBtn.addEventListener(
  "click",
  (e) => {
    toggleFullScreen()
  },
  false
)

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else if (document.exitFullscreen) {
    document.exitFullscreen()
  }
}

// repeat
function resetGrid () {
  gameBoard.innerHTML = ''
  grid = new Grid(gameBoard)
  grid.getRandomEmptyCell()
    .linkTile(new Tile(gameBoard))
  grid.getRandomEmptyCell()
    .linkTile(new Tile(gameBoard))
  setupInput()
  tryes = 0
  accaunt = 0
  const t = document.querySelector('.tryes')
  const a = document.querySelector('.accaunt')
  t.innerHTML = 0
  a.innerHTML = 0
}
const repeat = document.querySelector('.repeat')
repeat.addEventListener('click', resetGrid)

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
