import { useEffect, useState } from 'react'

import Xiaoxiaole, { ChessBoard, Piece } from './Xiaoxiaole'
import Item from './Item'

export const row = 6
export const col = 6

const _Xiaoxiaole = () => {
    const [chessBoard, setChessBoard] = useState<ChessBoard>([])

    useEffect(() => {
        if (window.xiaoxiaole) {
            return
        }
        window.xiaoxiaole = new Xiaoxiaole({
            row,
            col,
            handleChessboardChange: setChessBoard,
            handleGameOver: () => alert('游戏结束')
        })
    }, [])

    return (
        <div>
            <h1 className="text-center text-[40px] mb-[100px]">消消乐</h1>
            <div className="overflow-hidden mx-auto flex flex-wrap" style={{ width: row * 50 }}>
                {chessBoard.map((row: Piece[], rowIndex: number) => {
                    return row.map((col: Piece, colIndex: number) => {
                        return <Item key={col.id} col={col} rowIndex={rowIndex} colIndex={colIndex} />
                    })
                })}
            </div>
        </div>
    )
}

export default _Xiaoxiaole
