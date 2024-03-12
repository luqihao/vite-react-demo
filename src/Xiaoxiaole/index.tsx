import { useEffect, useMemo, useState } from 'react'

import Xiaoxiaole, { ChessBoard } from './Xiaoxiaole'
import Item from './Item'

export const row = 5
export const col = 5

const _Xiaoxiaole = () => {
    const [xiaoxiaole] = useState(new Xiaoxiaole({ row, col }))

    const chessBoard: ChessBoard = useMemo(() => {
        return xiaoxiaole.chessBoard
    }, [xiaoxiaole.chessBoard])

    useEffect(() => {
        window.xiaoxiaole = xiaoxiaole
    }, [xiaoxiaole])

    return (
        <div>
            <h1 className="text-center text-[40px] mb-[100px]">消消乐</h1>
            <div className="overflow-hidden mx-auto  w-[250px]">
                {chessBoard.map((row: (number | null)[], rowIndex: number) => {
                    return (
                        <div key={row + ',' + rowIndex} id={row + ',' + rowIndex} className="flex">
                            {row.map((col: number | null, colIndex: number) => {
                                return (
                                    <Item
                                        key={col + ',' + colIndex}
                                        col={col}
                                        rowIndex={rowIndex}
                                        colIndex={colIndex}
                                    />
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default _Xiaoxiaole
