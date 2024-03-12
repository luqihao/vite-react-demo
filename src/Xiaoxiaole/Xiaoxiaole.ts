interface IOptions {
    row: number
    col: number
    handleChessboardChange: (arr: ChessBoard) => void
    handleGameOver: () => void
}
export type Piece = { id: number; value: number | null }
export type ChessBoard = Piece[][]

export const colors = ['red', 'green', 'blue', 'orange', 'purple']

function clone2DArray(arr: unknown[][]): ChessBoard {
    const clone = []
    for (let i = 0; i < arr.length; i++) {
        const subArr = []
        for (let j = 0; j < arr[i].length; j++) {
            subArr.push(arr[i][j])
        }
        clone.push(subArr)
    }
    return clone as ChessBoard
}

export function wait(time = 0): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}

export default class Xiaoxiaole {
    // 棋子数据
    chessPieces: number[] = [1, 2, 3, 4, 5]
    // 棋盘数据
    chessBoard: ChessBoard = []
    row: number = 0
    col: number = 0
    handleChessboardChange: (arr: ChessBoard) => void
    handleGameOver = () => alert('游戏结束')
    index: number = 1

    constructor({ row, col, handleChessboardChange, handleGameOver }: IOptions) {
        this.row = row
        this.col = col
        this.handleChessboardChange = handleChessboardChange
        this.handleGameOver = handleGameOver

        this.initChessBoard(row, col)
    }

    /**
     * 初始化棋盘
     */
    initChessBoard(row: number, col: number) {
        const arr = clone2DArray([])
        for (let i = 0; i < row; i++) {
            arr[i] = new Array(col)
            for (let j = 0; j < col; j++) {
                let value = this.getRandomPiece()
                // 纵向不能生成连续3个一样的棋子
                while (i > 1 && arr[i - 1][j]?.value === value && arr[i - 2][j]?.value === value) {
                    value = this.getRandomPiece()
                }
                // 横向不能生成连续3个一样的棋子
                while (j > 1 && arr[i][j - 1]?.value === value && arr[i][j - 2]?.value === value) {
                    value = this.getRandomPiece()
                }
                arr[i][j] = { id: this.index, value }
                this.index++
            }
        }
        this.chessBoard = arr as ChessBoard
        this.handleChessboardChange(arr as ChessBoard)

        console.log('初始化棋盘')
        console.table([...arr].map(v => v.map(v => v.value)))
        if (this.checkGameOver()) {
            console.log('需要重新初始化棋盘')
            this.initChessBoard(row, col)
        }
    }

    /**
     * 生成随机棋子
     */
    getRandomPiece(): number {
        const randomIndex = Math.floor(Math.random() * this.chessPieces.length)
        return this.chessPieces[randomIndex]
    }

    /**
     * 交换两个下标内容
     */
    swapPiece([row1, col1]: [number, number], [row2, col2]: [number, number]) {
        if (this.chessBoard[row1][col1] === this.chessBoard[row2][col2]) {
            console.log('棋子相同，不进行交换')
            return false
        }

        const arr = clone2DArray(this.chessBoard)
        const temp = arr[row1][col1]
        arr[row1][col1] = arr[row2][col2]
        arr[row2][col2] = temp
        this.chessBoard = arr as ChessBoard
        this.handleChessboardChange(arr as ChessBoard)

        console.log('交换后')
        console.table([...arr].map(v => v.map(v => v.value)))
        this.checkAndRemoveMatchesAt(
            [
                [row1, col1],
                [row2, col2]
            ] as unknown as number[][],
            true
        )

        return true
    }
    /**
     * 检查消除
     */
    checkAndRemoveMatchesAt(pos: number[][], isSwap = false) {
        let matches: number[][] = []
        for (const [row, col] of pos) {
            // 横向匹配
            const cols = this.checkMatch(row, col, true)
            // 纵向匹配
            const rows = this.checkMatch(row, col, false)
            matches = matches.concat(cols, rows)
        }

        const arr = clone2DArray(this.chessBoard)

        if (matches.length < 1) {
            if (isSwap) {
                const [row1, col1] = pos[0]
                const [row2, col2] = pos[1]

                const temp = arr[row1][col1]
                arr[row1][col1] = arr[row2][col2]
                arr[row2][col2] = temp
                this.chessBoard = arr as ChessBoard
                this.handleChessboardChange(arr as ChessBoard)

                console.log('交换后无法消除，还原位置')
                console.table([...arr].map(v => v.map(v => v.value)))
            }
            if (this.checkGameOver()) {
                console.log('游戏结束')
                this.handleGameOver()
            } else {
                console.log('继续游戏')
            }
            return
        }

        // 消除
        for (const [row, col] of matches) {
            arr[row][col].value = null
        }

        this.chessBoard = arr as ChessBoard
        this.handleChessboardChange(arr as ChessBoard)
        console.log('消除后')
        console.table([...arr].map(v => v.map(v => v.value)))
        const movedPos = [...this.movePiecesDown(), ...this.refillAndCheck()]
        if (movedPos.length > 0) {
            console.log('消除并填充棋子后再次检查消除')
            this.checkAndRemoveMatchesAt(movedPos)
        } else {
            this.checkGameOver() && alert('游戏结束')
        }
    }

    /**
     * 检查单个棋子
     */
    checkMatch(row: number, col: number, horizontal: boolean) {
        const matches = [[row, col]]
        const current = this.chessBoard[row][col].value
        let i = 1
        if (horizontal) {
            // 往左遍历
            while (col - i >= 0 && this.chessBoard[row][col - i].value === current) {
                matches.push([row, col - i])
                i++
            }
            i = 1
            // 往右遍历
            while (col + i < this.chessBoard[row].length && this.chessBoard[row][col + i].value === current) {
                matches.push([row, col + i])
                i++
            }
        } else {
            // 往上
            while (row - i >= 0 && this.chessBoard[row - i][col].value === current) {
                matches.push([row - i, col])
                i++
            }
            i = 1
            // 往下
            while (row + i < this.chessBoard.length && this.chessBoard[row + i][col].value === current) {
                matches.push([row + i, col])
                i++
            }
        }
        return matches.length >= 3 ? matches : []
    }

    /**
     * 向下移动棋子
     */
    movePiecesDown() {
        const movedPos = []
        const arr = clone2DArray(this.chessBoard)
        for (let col = arr[0].length - 1; col >= 0; col--) {
            let nullCount = 0
            for (let row = arr.length - 1; row >= 0; row--) {
                const piece = arr[row][col].value
                if (piece === null) {
                    nullCount++
                } else if (nullCount > 0) {
                    arr[row + nullCount][col] = arr[row][col]
                    arr[row][col] = { ...arr[row][col], value: null }
                    movedPos.push([row + nullCount, col])
                }
            }
        }
        this.chessBoard = arr as ChessBoard
        this.handleChessboardChange(arr as ChessBoard)
        return movedPos
    }

    /**
     * 重新填充和检查棋子
     */
    refillAndCheck() {
        const movedPos = []
        const arr = clone2DArray(this.chessBoard)
        for (let row = 0; row < arr.length; row++) {
            for (let col = 0; col < arr[row].length; col++) {
                if (arr[row][col].value === null) {
                    arr[row][col] = { id: this.index, value: this.getRandomPiece() }
                    this.index++
                    movedPos.push([row, col])
                }
            }
        }

        this.chessBoard = arr as ChessBoard
        this.handleChessboardChange(arr as ChessBoard)
        console.log('补充后的棋子')
        console.table([...arr].map(v => v.map(v => v.value)))

        return movedPos
    }

    /**
     * 检测游戏是否结束
     */
    checkGameOver() {
        for (let i = 0; i < this.row; i++) {
            // 横向检查
            for (let j = 0; j < this.col; j++) {
                let count = 1
                const max = j + 4 < this.col ? j + 4 : this.col
                for (let k = j + 1; k < max; k++) {
                    //
                    if (this.chessBoard[i][j].value === this.chessBoard[i][k].value) {
                        count++
                    }
                }
                // 满足 [x] [x] [*] [x] 或者 [x] [*] [x] [x]
                if (count >= 3) {
                    return false
                }

                if (j < this.col - 2) {
                    // 满足
                    // [x] [*] [*]
                    // [*] [x] [x]
                    // [x] [*] [*]
                    if (
                        this.chessBoard[i][j + 1].value === this.chessBoard[i][j + 2].value &&
                        (this.chessBoard[i][j + 1].value === (i > 0 && this.chessBoard[i - 1][j].value) ||
                            this.chessBoard[i][j + 1].value === (i < this.row - 1 && this.chessBoard[i + 1][j].value))
                    ) {
                        return false
                    }

                    // 满足
                    // [*] [x] [*]
                    // [x] [*] [x]
                    // [*] [x] [*]
                    if (
                        this.chessBoard[i][j].value === this.chessBoard[i][j + 2].value &&
                        (this.chessBoard[i][j].value === (i > 0 && this.chessBoard[i - 1][j + 1].value) ||
                            this.chessBoard[i][j].value === (i < this.row - 1 && this.chessBoard[i + 1][j + 1].value))
                    ) {
                        return false
                    }

                    // 满足
                    // [*] [*] [x]
                    // [x] [x] [*]
                    // [*] [*] [x]
                    if (
                        this.chessBoard[i][j].value === this.chessBoard[i][j + 1].value &&
                        (this.chessBoard[i][j].value === (i > 0 && this.chessBoard[i - 1][j + 2].value) ||
                            this.chessBoard[i][j].value === (i < this.row - 1 && this.chessBoard[i + 1][j + 2].value))
                    ) {
                        return false
                    }
                }
            }
            // 纵向检查
            for (let j = 0; j < this.col; j++) {
                let count = 1
                const max = i + 4 < this.row ? i + 4 : this.row
                for (let k = i + 1; k < max; k++) {
                    if (this.chessBoard[i][j].value === this.chessBoard[k][j].value) {
                        count++
                    }
                }
                // 满足 或者
                // [x] [x]
                // [x] [*]
                // [*] [x]
                // [x] [x]
                if (count >= 3) {
                    return false
                }

                if (i < this.row - 2) {
                    // 满足
                    // [x] [*] [x]
                    // [*] [x] [*]
                    // [*] [x] [*]
                    if (
                        this.chessBoard[i + 1][j].value === this.chessBoard[i + 2][j].value &&
                        (this.chessBoard[i + 1][j].value === (j > 0 && this.chessBoard[i][j - 1].value) ||
                            this.chessBoard[i + 1][j].value === (j < this.col - 1 && this.chessBoard[i][j + 1].value))
                    ) {
                        return false
                    }

                    // 满足
                    // [*] [x] [*]
                    // [x] [*] [x]
                    // [*] [x] [*]
                    if (
                        this.chessBoard[i][j].value === this.chessBoard[i + 2][j].value &&
                        (this.chessBoard[i][j].value === (j > 0 && this.chessBoard[i + 1][j - 1].value) ||
                            this.chessBoard[i][j].value === (j < this.col - 1 && this.chessBoard[i + 1][j + 1].value))
                    ) {
                        return false
                    }

                    // 满足
                    // [*] [x] [*]
                    // [*] [x] [*]
                    // [x] [*] [x]
                    if (
                        this.chessBoard[i][j].value === this.chessBoard[i + 1][j].value &&
                        (this.chessBoard[i][j].value === (j > 0 && this.chessBoard[i + 2][j - 1].value) ||
                            this.chessBoard[i][j].value === (j < this.col - 1 && this.chessBoard[i + 2][j + 1].value))
                    ) {
                        return false
                    }
                }
            }
        }
        return true
    }
}
