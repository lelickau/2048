import Cell from '../Cell/Cell'

const GRID_SIZE = 4
const CELLS_COUNT = GRID_SIZE * GRID_SIZE

class Grid {
    constructor(gridElement) {
        this.cells = []
        for (let i = 0; i < CELLS_COUNT; i += 1) {
            this.cells.push(
                new Cell(gridElement, i % GRID_SIZE, Math.floor(i / GRID_SIZE))
            )
        }

        this.cellGroupedByColumn = this.groupCellsByColumn()
        this.cellGroupedByReversedColumn = this.cellGroupedByColumn.map((column) => [...column].reverse())
        this.cellGroupedByRow = this.groupCellByRow()
        this.cellGroupedByReversedRow = this.cellGroupedByRow.map((row) => [...row].reverse())
    }

    getRandomEmptyCell() {
        const emptyCells = this.cells.filter((cell) => cell.isEmpty())
        const randomIndex = Math.floor(Math.random() * emptyCells.length)
        return emptyCells[randomIndex]
    }

    groupCellsByColumn() {
        return this.cells.reduce((groupedCells, cell) => {
            groupedCells[cell.x] = groupedCells[cell.x] || []
            groupedCells[cell.x][cell.y] = cell
            return groupedCells
        }, [])
    }

    groupCellByRow() {
        return this.cells.reduce((groupedCells, cell) => {
            groupedCells[cell.y] = groupedCells[cell.y] || []
            groupedCells[cell.y][cell.x] = cell
            return groupedCells
        }, [])
    }
}

export default Grid
