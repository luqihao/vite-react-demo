import { gsap } from 'gsap'
import { uniq } from 'lodash-es'

const isAndroid = (): boolean => Boolean(navigator.userAgent.match(/Android/i))
const isIos = (): boolean => Boolean(navigator.userAgent.match(/iPhone|iPad|iPod/i))
const isOpera = (): boolean => Boolean(navigator.userAgent.match(/Opera Mini/i))
const isWindows = (): boolean => Boolean(navigator.userAgent.match(/IEMobile/i))

const isMobile = Boolean(isAndroid() || isIos() || isOpera() || isWindows())

interface IOptions {
    containerId: string
    row: number
    col: number
    pieceSize: number
    restTime?: number
    handleScoreChange?: (score: number) => void
    handleComboChange?: (combo: number) => void
    handleMaxComboChange?: (combo: number) => void
    handleRecordChange?: (list: string[]) => void
    handleSummaryChange?: (list: number[]) => void
    handleGameOver?: () => void
    handleRestTimeChange?: (restTime: number) => void
}

type Piece = {
    id: string
    value: number | null
    ele: HTMLDivElement
    rowIndex: number
    colIndex: number
}
type ChessBoard = Piece[][]

gsap.defaults({
    duration: 0.2
})

const idPrefix = 'piece-'

const bgColor = ['red', 'green', 'blue', 'orange', 'purple', 'pink']

export default class Xiaoxiaole {
    // 棋子数据
    chessPieces: number[] = [1, 2, 3, 4, 5, 6]
    // 棋盘数据
    chessBoard: ChessBoard = []
    // 棋盘容器
    container: HTMLElement | null = null
    // 棋盘尺寸-行数
    row: number = 5
    // 棋盘尺寸-列数
    col: number = 5
    // 棋子宽高
    pieceSize: number = 50
    // id递增
    index: number = 1
    // 总数
    score: number = 0
    // 连击数
    combo: number = 0
    // 最大连击数
    maxCombo: number = 0
    // 当前选中棋子
    selectedPiece: Piece | null = null
    // 是否正在执行动画
    running: boolean = false
    // 记录当前消除棋子的值，坐标和时间
    record: string[] = []
    // 记录消除各棋子个数
    summary: number[] = []
    // 移动端触碰初始位置
    originPos = {
        startX: 0,
        startY: 0
    }
    // 原始倒计时
    originRestTime = 60
    // 倒计时
    restTime: number = 60
    // 倒计时定时器
    timer: number = 0

    _handleGameOver = () => {
        if (this.running) {
            return
        }
        alert(`游戏结束，你的最终得分是：${this.score}`)
        this.handleGameOver()
        this.resetData()
    }
    handleGameOver = () => console.log(`游戏结束，你的最终得分是：${this.score}`)
    handleScoreChange = (value: number) => console.log('当前分数：', value)
    handleComboChange = (value: number) => console.log('当前连击数：', value)
    handleMaxComboChange = (value: number) => console.log('最大连击数：', value)
    handleRestTimeChange = (value: number) => console.log('剩余秒数：', value)
    handleRecordChange = (list: string[]) => console.log('当前消除记录：', list)
    handleSummaryChange = (list: number[]) => console.log('当前棋子消除个数汇总：', list)

    constructor({
        containerId,
        row = 5,
        col = 5,
        pieceSize,
        restTime = 60,
        handleGameOver,
        handleScoreChange,
        handleComboChange,
        handleMaxComboChange,
        handleRecordChange,
        handleSummaryChange,
        handleRestTimeChange
    }: IOptions) {
        handleGameOver && (this.handleGameOver = handleGameOver)
        handleScoreChange && (this.handleScoreChange = handleScoreChange)
        handleComboChange && (this.handleComboChange = handleComboChange)
        handleMaxComboChange && (this.handleMaxComboChange = handleMaxComboChange)
        handleRestTimeChange && (this.handleRestTimeChange = handleRestTimeChange)
        handleRecordChange && (this.handleRecordChange = handleRecordChange)
        handleSummaryChange && (this.handleSummaryChange = handleSummaryChange)
        this.container = document.getElementById(containerId)
        this.row = row
        this.col = col
        this.pieceSize = pieceSize
        this.restTime = restTime
        this.originRestTime = restTime
        this.initChessBoard(row, col)
    }

    setScore = (value: number) => {
        this.score = value
        this.handleScoreChange(value)
    }

    setCombo = (value: number) => {
        this.combo = value
        this.handleComboChange(value)

        if (value > this.maxCombo) {
            this.setMaxCombo(value)
        }
    }

    setMaxCombo = (value: number) => {
        this.maxCombo = value
        this.handleMaxComboChange(value)
    }

    setRestTime = (value: number) => {
        this.restTime = value
        this.handleRestTimeChange(value)
    }

    setRecord = (list: number[][]) => {
        const temp = list.map(v => {
            const value = this.chessBoard[v[0]][v[1]].value || 0
            this.summary[value] = (this.summary[value] || 0) + 1
            return `${value}${v[0]}${v[1]}${Date.now()}`
        })
        this.record = [...this.record, ...temp]
        this.handleRecordChange(this.record)
        this.handleSummaryChange(this.summary)
    }

    gameStart = () => {
        if (this.restTime > 0) {
            this.timer = setInterval(() => {
                if (this.restTime > 0) {
                    this.setRestTime(this.restTime - 1)
                } else {
                    this._handleGameOver()
                }
            }, 1000)
        } else {
            this.handleRestTimeChange(Number.MAX_SAFE_INTEGER)
        }
    }

    // 重置游戏数据
    resetData = () => {
        this.timer && clearInterval(this.timer)
        this.restTime = this.originRestTime
        this.chessBoard.flat().forEach(v => {
            if (isMobile) {
                v.ele.removeEventListener('touchstart', this.handleTouchStart)
                v.ele.removeEventListener('touchmove', this.handleTouchMove)
                v.ele.removeEventListener('touchend', this.handleTouchEnd)
            } else {
                v.ele.removeEventListener('click', this.handleClick)
            }
            this.container?.removeChild(v.ele)
        })
        this.chessBoard = []
        this.summary = []
        this.setRecord([])
        this.index = 1
        this.setScore(0)
        this.setCombo(0)
        this.setMaxCombo(0)
        this.running = false
        this.originPos = {
            startX: 0,
            startY: 0
        }
    }

    // 初始化棋盘
    async initChessBoard(row: number, col: number) {
        this.resetData()
        this.running = true
        const temp = []
        for (let i = 0; i < row; i++) {
            temp[i] = new Array(col)
            for (let j = 0; j < col; j++) {
                let value = this.getRandomPiece()
                // 纵向不能生成连续3个一样的棋子
                while (i > 1 && temp[i - 1][j]?.value === value && temp[i - 2][j]?.value === value) {
                    value = this.getRandomPiece()
                }
                // 横向不能生成连续3个一样的棋子
                while (j > 1 && temp[i][j - 1]?.value === value && temp[i][j - 2]?.value === value) {
                    value = this.getRandomPiece()
                }
                temp[i][j] = this.createPiece(value, i, j)
            }
        }
        this.chessBoard = temp as ChessBoard
        if (this.checkGameOver()) {
            this.initChessBoard(row, col)
        } else {
            await this.playInitAnimation()
        }
        this.running = false
    }

    // 处理棋子点击事件
    handlePieceClick = async ({
        target,
        colIndex,
        rowIndex,
        piece
    }: {
        target: HTMLElement
        colIndex: number
        rowIndex: number
        piece: Piece
    }) => {
        if (this.running) {
            return
        }

        if (this.selectedPiece?.id === piece.id) {
            this.selectedPiece.ele.style.borderColor = '#fff'
            this.selectedPiece = null
            return
        }
        if (
            !this.selectedPiece ||
            (rowIndex !== this.selectedPiece.rowIndex && colIndex !== this.selectedPiece.colIndex) ||
            (rowIndex === this.selectedPiece.rowIndex && Math.abs(colIndex - this.selectedPiece.colIndex) > 1) ||
            (colIndex === this.selectedPiece.colIndex && Math.abs(rowIndex - this.selectedPiece.rowIndex) > 1)
        ) {
            this.selectedPiece && (this.selectedPiece.ele.style.borderColor = '#fff')
            target.style.borderColor = '#000'
            this.selectedPiece = piece
            return
        }
        this.running = true
        this.swapPiece([this.selectedPiece.rowIndex, this.selectedPiece.colIndex], [rowIndex, colIndex])
        const matchedPieces: number[][] = this.checkMatchedPieces([
            [this.selectedPiece.rowIndex, this.selectedPiece.colIndex],
            [rowIndex, colIndex]
        ])
        const canRemove = matchedPieces.length > 0
        if (!canRemove) {
            this.swapPiece([this.selectedPiece.rowIndex, this.selectedPiece.colIndex], [rowIndex, colIndex])
        }
        await this.playSwapAnimation(
            [this.selectedPiece.rowIndex, this.selectedPiece.colIndex],
            [rowIndex, colIndex],
            !canRemove
        )
        if (canRemove) {
            await this.checkAndRemoveMatchesAt(
                [
                    [this.selectedPiece.rowIndex, this.selectedPiece.colIndex],
                    [rowIndex, colIndex]
                ],
                matchedPieces
            )
        }
        this.selectedPiece.ele.style.borderColor = '#fff'
        this.selectedPiece = null
        this.running = false
        if (this.restTime === 0 && this.originRestTime !== 0) {
            this._handleGameOver()
        }
    }

    handleClick = async (e: Event) => {
        const target = e.target as HTMLDivElement
        const colIndex = parseInt(target.style.left) / this.pieceSize
        const rowIndex = parseInt(target.style.top) / this.pieceSize
        const piece = this.chessBoard[rowIndex][colIndex]
        await this.handlePieceClick({ target, colIndex, rowIndex, piece })
    }

    handleTouchStart = async (e: TouchEvent) => {
        // 记录起始触摸位置
        const touch = e.touches[0]
        const startX = touch.pageX
        const startY = touch.pageY

        // 将起始位置存储在 ref 中
        this.originPos.startX = startX
        this.originPos.startY = startY

        const target = e.target as HTMLDivElement
        const colIndex = parseInt(target.style.left) / this.pieceSize
        const rowIndex = parseInt(target.style.top) / this.pieceSize
        const piece = this.chessBoard[rowIndex][colIndex]

        await this.handlePieceClick({ target, colIndex, rowIndex, piece })
    }

    handleTouchMove = async (e: TouchEvent) => {
        if (!this.originPos.startX || !this.originPos.startY || !this.selectedPiece || this.running) {
            return
        }
        const target = e.target as HTMLDivElement
        const colIndex = parseInt(target.style.left) / this.pieceSize
        const rowIndex = parseInt(target.style.top) / this.pieceSize
        // 获取当前触摸位置
        const touch = e.touches[0]
        const currentX = touch.pageX
        const currentY = touch.pageY

        // 计算水平和垂直位移
        const deltaX = currentX - this.originPos.startX
        const deltaY = currentY - this.originPos.startY

        // 判断手指移动方向（左右还是上下）
        let direction = null
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? 'right' : 'left'
        } else {
            direction = deltaY > 0 ? 'bottom' : 'top'
        }
        let _row = rowIndex
        let _col = colIndex
        switch (direction) {
            case 'left':
                _col = _col > 0 ? _col - 1 : _col
                break
            case 'right':
                _col = _col < this.col - 1 ? _col + 1 : _col
                break
            case 'top':
                _row = _row > 0 ? _row - 1 : _row
                break
            case 'bottom':
                _row = _row < this.row - 1 ? _row + 1 : _row
                break
        }
        if (!(_row === rowIndex && _col === colIndex)) {
            const piece = this.chessBoard[_row][_col]
            const target = piece.ele

            await this.handlePieceClick({ target, colIndex: _col, rowIndex: _row, piece })
        }
        this.originPos = {
            startX: 0,
            startY: 0
        }
    }

    handleTouchEnd = () => {
        this.originPos = {
            startX: 0,
            startY: 0
        }
    }

    // 生成随机棋子值
    getRandomPiece(): number {
        const randomIndex = Math.floor(Math.random() * this.chessPieces.length)
        return this.chessPieces[randomIndex]
    }

    /**
     * 生成棋子
     */
    createPiece = (value: number, rowIndex: number, colIndex: number) => {
        const id = idPrefix + this.index.toString()
        const ele = document.createElement('div')
        ele.innerHTML = value.toString()
        ele.setAttribute('id', id)
        ele.setAttribute(
            'style',
            `display: inline-flex; align-items: center; justify-content:center; width: ${this.pieceSize}px; height: ${
                this.pieceSize
            }px; position: absolute; left: ${colIndex * this.pieceSize}px; top: -${this.pieceSize}px; background: ${
                bgColor[value - 1]
            }; border: 2px solid #fff; color: #fff`
        )

        if (isMobile) {
            ele.addEventListener('touchstart', this.handleTouchStart)
            ele.addEventListener('touchmove', this.handleTouchMove)
            ele.addEventListener('touchend', this.handleTouchEnd)
        } else {
            ele.addEventListener('click', this.handleClick)
        }
        this.container?.appendChild(ele)
        this.index++
        return { id, value, ele, rowIndex, colIndex }
    }

    // 交换棋子
    swapPiece([row1, col1]: [number, number], [row2, col2]: [number, number]) {
        const temp = this.chessBoard[row1][col1]
        this.chessBoard[row1][col1] = { ...this.chessBoard[row2][col2], rowIndex: row1, colIndex: col1 }
        this.chessBoard[row2][col2] = { ...temp, rowIndex: row2, colIndex: col2 }
    }

    // 检查单个棋子
    checkMatch(row: number, col: number, horizontal: boolean) {
        const list = this.chessBoard
        const matches = [[row, col]]
        const current = list[row][col].value
        let i = 1
        if (horizontal) {
            // 往左遍历
            while (col - i >= 0 && list[row][col - i].value === current) {
                matches.push([row, col - i])
                i++
            }
            i = 1
            // 往右遍历
            while (col + i < list[row].length && list[row][col + i].value === current) {
                matches.push([row, col + i])
                i++
            }
        } else {
            // 往上遍历
            while (row - i >= 0 && list[row - i][col].value === current) {
                matches.push([row - i, col])
                i++
            }
            i = 1
            // 往下遍历
            while (row + i < list.length && list[row + i][col].value === current) {
                matches.push([row + i, col])
                i++
            }
        }
        return matches.length >= 3 ? matches : []
    }

    // 检查棋子
    checkMatchedPieces(pos: number[][]): number[][] {
        let matches: number[][] = []
        for (const [row, col] of pos) {
            // 横向匹配
            const cols = this.checkMatch(row, col, true)
            // 纵向匹配
            const rows = this.checkMatch(row, col, false)
            matches = matches.concat(cols, rows)
        }
        return matches
    }

    // 向下移动棋子
    async movePiecesDown() {
        const movedPos: number[][] = []
        for (let col = this.chessBoard[0].length - 1; col >= 0; col--) {
            let nullCount = 0
            for (let row = this.chessBoard.length - 1; row >= 0; row--) {
                const value = this.chessBoard[row][col].value
                if (value === null) {
                    nullCount++
                } else if (nullCount > 0) {
                    this.chessBoard[row + nullCount][col] = {
                        ...this.chessBoard[row][col],
                        rowIndex: row + nullCount,
                        colIndex: col
                    }
                    this.chessBoard[row][col] = {
                        ...this.chessBoard[row][col],
                        value: null,
                        rowIndex: row,
                        colIndex: col
                    }
                    movedPos.push([row + nullCount, col, nullCount])
                }
            }
        }
        if (movedPos.length > 0) {
            await this.playDownAnimation(movedPos)
        }
        return movedPos
    }

    // 重新填充和检查棋子
    async refillAndCheck() {
        const movedPos: number[][] = []
        for (let row = 0; row < this.chessBoard.length; row++) {
            for (let col = 0; col < this.chessBoard[row].length; col++) {
                if (this.chessBoard[row][col].value === null) {
                    const value = this.getRandomPiece()
                    this.chessBoard[row][col] = this.createPiece(value, row, col)
                    movedPos.push([row, col])
                }
            }
        }

        if (movedPos.length > 0) {
            await this.playFillAnimation(movedPos)
        }

        return movedPos
    }

    // 检查消除
    async checkAndRemoveMatchesAt(pos: number[][], matchedPieces?: number[][]) {
        const matches: number[][] =
            Array.isArray(matchedPieces) && matchedPieces.length > 0 ? matchedPieces : this.checkMatchedPieces(pos)

        if (matches.length < 1) {
            this.setCombo(0)
            this.checkGameOver() && this._handleGameOver()
            return
        }

        if (!matchedPieces) {
            this.setCombo(this.combo + 1)
        }

        const arr = uniq(matches.map(v => v.join(','))).map((v: string) => v.split(',').map(v => Number(v)))
        this.setScore((this.score += arr.length))
        this.setRecord(arr)

        for (const [row, col] of matches) {
            this.chessBoard[row][col].value = null
        }

        await this.playRemoveAnimation?.(matches)

        const movePieces = await this.movePiecesDown()
        const refillPieces = await this.refillAndCheck()

        const movedPos = movePieces.concat(refillPieces)

        if (movedPos.length > 0) {
            await this.checkAndRemoveMatchesAt(movedPos)
        } else {
            this.setCombo(0)
            this.checkGameOver() && this._handleGameOver()
        }
    }

    // 交换棋子动画
    playSwapAnimation = (
        [row1, col1]: [number, number],
        [row2, col2]: [number, number],
        reverse = true
    ): Promise<void> | undefined => {
        return new Promise(async resolve => {
            if (!this.selectedPiece) {
                resolve()
                return
            }

            const ele1 = document.querySelector(`#${this.chessBoard[row1][col1].id}`) as HTMLDivElement
            const originLeft1 = ele1 ? parseInt(ele1.style?.left) : 0
            const originTop1 = ele1 ? parseInt(ele1.style?.top) : 0

            const ele2 = document.querySelector(`#${this.chessBoard[row2][col2].id}`) as HTMLDivElement
            const originLeft2 = ele2 ? parseInt(ele2.style?.left) : 0
            const originTop2 = ele2 ? parseInt(ele2.style?.top) : 0

            if (row1 === row2) {
                await new Promise<void>(resolve => {
                    gsap.to(ele1, {
                        left: originLeft2
                    })
                    gsap.to(ele2, {
                        left: originLeft1,
                        onComplete: () => resolve()
                    })
                })
            } else if (col1 === col2) {
                await new Promise<void>(resolve => {
                    gsap.to(ele1, {
                        top: originTop2
                    })
                    gsap.to(ele2, {
                        top: originTop1,
                        onComplete: () => resolve()
                    })
                })
            }

            if (reverse) {
                if (row1 === row2) {
                    await new Promise<void>(resolve => {
                        gsap.to(ele1, {
                            left: originLeft1
                        })
                        gsap.to(ele2, {
                            left: originLeft2,
                            onComplete: () => resolve()
                        })
                    })
                } else if (col1 === col2) {
                    await new Promise<void>(resolve => {
                        gsap.to(ele1, {
                            top: originTop1
                        })
                        gsap.to(ele2, {
                            top: originTop2,
                            onComplete: () => resolve()
                        })
                    })
                }
            }
            resolve()
        })
    }

    // 执行消除棋子动画
    playRemoveAnimation = async (pos: number[][]): Promise<void> => {
        return new Promise(resolve => {
            const arr: string[] = []
            for (const [row, col] of pos) {
                arr.push(`#${this.chessBoard[row][col].id}`)
            }
            arr.forEach((id, i) => {
                gsap.to(id, {
                    opacity: 0,
                    scale: 0,
                    onComplete: () => {
                        const target = this.container?.querySelector(id)
                        target && this.container?.removeChild(target as Node)
                        i === arr.length - 1 && resolve()
                    }
                })
            })
        })
    }

    // 执行上方棋子下落动画
    playDownAnimation = (pos: number[][]): Promise<void> => {
        return new Promise(resolve => {
            const len = pos.length
            for (let i = 0; i < len; i++) {
                const [row, col, nullCount] = pos[i]
                const ele = document.querySelector(`#${this.chessBoard[row][col].id}`) as HTMLDivElement
                const originTop = ele ? parseInt(ele.style?.top) : 0
                gsap.to(`#${this.chessBoard[row][col].id}`, {
                    top: originTop + nullCount * this.pieceSize,
                    ease: 'bounce.out',
                    onComplete: () => {
                        if (i === len - 1) {
                            resolve()
                        }
                    }
                })
            }
        })
    }

    // 执行补充棋子下落动画
    playFillAnimation = (pos: number[][]): Promise<void> => {
        const len = pos.length
        return new Promise(resolve => {
            for (let i = 0; i < len; i++) {
                const [row, col] = pos[i]
                const id = `${this.chessBoard[row][col].id}`
                gsap.fromTo(
                    `#${id}`,
                    {
                        opacity: 0
                    },
                    {
                        opacity: 1,
                        top: this.pieceSize * row,
                        ease: 'bounce.out',
                        onComplete: () => {
                            if (i === len - 1) {
                                resolve()
                            }
                        }
                    }
                )
            }
        })
    }

    // 初始化动画
    playInitAnimation = async (): Promise<void> => {
        const [row, col] = [this.row, this.col]
        return new Promise(resolve => {
            for (let i = 0; i < row; i++) {
                for (let j = 0; j < col; j++) {
                    gsap.fromTo(
                        `#${this.chessBoard[i][j].id}`,
                        {
                            opacity: 0
                        },
                        {
                            opacity: 1,
                            top: this.pieceSize * i,
                            delay: (row + (col ? col : 0) - (j + i)) * 0.1,
                            ease: 'bounce.out',
                            onComplete: () => {
                                if (i === 0 && j === 0) {
                                    this.gameStart()
                                    resolve()
                                }
                            }
                        }
                    )
                }
            }
        })
    }

    // 检测游戏是否结束
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
