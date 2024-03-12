interface IOptions {
    row: number
    col: number
}

export type ChessBoard = (number | null)[][]

export const colors = ['#f52', 'green', 'blue', 'orange', 'purple']

export default class Xiaoxiaole {
    // 棋子数据
    chessPieces: number[] = [1, 2, 3, 4, 5]
    // 棋盘数据
    chessBoard: ChessBoard = []
    row: number = 0
    col: number = 0

    constructor({ row, col }: IOptions) {
        this.row = row
        this.col = col
        this.initChessBoard(row, col)
    }

    /**
     * 初始化棋盘
     */
    initChessBoard(row: number, col: number) {
        for (let i = 0; i < row; i++) {
            this.chessBoard[i] = new Array(col)
            for (let j = 0; j < col; j++) {
                let value = this.getRandomPiece()
                // 纵向不能生成连续3个一样的棋子
                while (i > 1 && this.chessBoard[i - 1][j] === value && this.chessBoard[i - 2][j] === value) {
                    value = this.getRandomPiece()
                }
                // 横向不能生成连续3个一样的棋子
                while (j > 1 && this.chessBoard[i][j - 1] === value && this.chessBoard[i][j - 2] === value) {
                    value = this.getRandomPiece()
                }
                this.chessBoard[i][j] = value
            }
        }
        console.log('初始化棋盘')
        console.table([...this.chessBoard])
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
        console.log(this.chessBoard[row1][col1], this.chessBoard[row2][col2])
        const temp = this.chessBoard[row1][col1]
        this.chessBoard[row1][col1] = this.chessBoard[row2][col2]
        this.chessBoard[row2][col2] = temp
        console.log('交换后')
        console.table([...this.chessBoard])
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
        if (matches.length < 1) {
            if (isSwap) {
                const [row1, col1] = pos[0]
                const [row2, col2] = pos[1]
                const temp = this.chessBoard[row1][col1]
                this.chessBoard[row1][col1] = this.chessBoard[row2][col2]
                this.chessBoard[row2][col2] = temp
                console.log('交换后无法消除，还原位置')
                console.table([...this.chessBoard])
            }
            if (this.checkGameOver()) {
                console.log('游戏结束')
                alert('游戏结束')
            } else {
                console.log('继续游戏')
            }
            return
        }
        // 消除
        for (const [row, col] of matches) {
            this.chessBoard[row][col] = null
        }
        console.log('消除后')
        console.table([...this.chessBoard])
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
        const current = this.chessBoard[row][col]
        let i = 1
        if (horizontal) {
            // 往左遍历
            while (col - i >= 0 && this.chessBoard[row][col - i] === current) {
                matches.push([row, col - i])
                i++
            }
            i = 1
            // 往右遍历
            while (col + i < this.chessBoard[row].length && this.chessBoard[row][col + i] === current) {
                matches.push([row, col + i])
                i++
            }
        } else {
            // 往上
            while (row - i >= 0 && this.chessBoard[row - i][col] === current) {
                matches.push([row - i, col])
                i++
            }
            i = 1
            // 往下
            while (row + i < this.chessBoard.length && this.chessBoard[row + i][col] === current) {
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
        for (let col = this.chessBoard[0].length - 1; col >= 0; col--) {
            let nullCount = 0
            for (let row = this.chessBoard.length - 1; row >= 0; row--) {
                const piece = this.chessBoard[row][col]
                if (piece === null) {
                    nullCount++
                } else if (nullCount > 0) {
                    this.chessBoard[row + nullCount][col] = this.chessBoard[row][col]
                    this.chessBoard[row][col] = null
                    movedPos.push([row + nullCount, col])
                }
            }
        }
        return movedPos
    }

    /**
     * 重新填充和检查棋子
     */
    refillAndCheck() {
        const movedPos = []

        for (let row = 0; row < this.chessBoard.length; row++) {
            for (let col = 0; col < this.chessBoard[row].length; col++) {
                if (this.chessBoard[row][col] === null) {
                    this.chessBoard[row][col] = this.getRandomPiece()
                    movedPos.push([row, col])
                }
            }
        }

        console.log('补充后的棋子')
        console.table([...this.chessBoard])

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
                    if (this.chessBoard[i][j] === this.chessBoard[i][k]) {
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
                        this.chessBoard[i][j + 1] === this.chessBoard[i][j + 2] &&
                        (this.chessBoard[i][j + 1] === (i > 0 && this.chessBoard[i - 1][j]) ||
                            this.chessBoard[i][j + 1] === (i < this.row - 1 && this.chessBoard[i + 1][j]))
                    ) {
                        return false
                    }

                    // 满足
                    // [*] [x] [*]
                    // [x] [*] [x]
                    // [*] [x] [*]
                    if (
                        this.chessBoard[i][j] === this.chessBoard[i][j + 2] &&
                        (this.chessBoard[i][j] === (i > 0 && this.chessBoard[i - 1][j + 1]) ||
                            this.chessBoard[i][j] === (i < this.row - 1 && this.chessBoard[i + 1][j + 1]))
                    ) {
                        return false
                    }

                    // 满足
                    // [*] [*] [x]
                    // [x] [x] [*]
                    // [*] [*] [x]
                    if (
                        this.chessBoard[i][j] === this.chessBoard[i][j + 1] &&
                        (this.chessBoard[i][j] === (i > 0 && this.chessBoard[i - 1][j + 2]) ||
                            this.chessBoard[i][j] === (i < this.row - 1 && this.chessBoard[i + 1][j + 2]))
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
                    if (this.chessBoard[i][j] === this.chessBoard[k][j]) {
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
                        this.chessBoard[i + 1][j] === this.chessBoard[i + 2][j] &&
                        (this.chessBoard[i + 1][j] === (j > 0 && this.chessBoard[i][j - 1]) ||
                            this.chessBoard[i + 1][j] === (j < this.col - 1 && this.chessBoard[i][j + 1]))
                    ) {
                        return false
                    }

                    // 满足
                    // [*] [x] [*]
                    // [x] [*] [x]
                    // [*] [x] [*]
                    if (
                        this.chessBoard[i][j] === this.chessBoard[i + 2][j] &&
                        (this.chessBoard[i][j] === (j > 0 && this.chessBoard[i + 1][j - 1]) ||
                            this.chessBoard[i][j] === (j < this.col - 1 && this.chessBoard[i + 1][j + 1]))
                    ) {
                        return false
                    }

                    // 满足
                    // [*] [x] [*]
                    // [*] [x] [*]
                    // [x] [*] [x]
                    if (
                        this.chessBoard[i][j] === this.chessBoard[i + 1][j] &&
                        (this.chessBoard[i][j] === (j > 0 && this.chessBoard[i + 2][j - 1]) ||
                            this.chessBoard[i][j] === (j < this.col - 1 && this.chessBoard[i + 2][j + 1]))
                    ) {
                        return false
                    }
                }
            }
        }
        return true
    }
}
