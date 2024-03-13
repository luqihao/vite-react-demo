import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

import Xiaoxiaole, { ChessBoard, Piece } from './Xiaoxiaole'
import Item from './Item'

export const row = 6
export const col = 6
export const width = 50
export const padding = 4
export const idPrefix = 'piece-'

const _Xiaoxiaole = () => {
    const [chessBoard, setChessBoard] = useState<ChessBoard>([])
    const [selectedPiece, setSelectedPiece] = useState<Required<Piece> | null>(null)

    const container = useRef<HTMLDivElement>(null)

    const { contextSafe } = useGSAP({ scope: container })

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

    const moveDistance = ([originRow, originCol]: [number, number], [targetRow, targetCol]: [number, number]) => {
        if (originRow === targetRow) {
            return originCol > targetCol ? { translateX: -width } : { translateX: width }
        }

        if (originCol === targetCol) {
            return originRow > targetRow ? { translateY: -width } : { translateY: width }
        }

        return {}
    }

    const playAnimation = (piece: Piece, rowIndex: number, colIndex: number, reverse = true) => {
        if (!selectedPiece) {
            return
        }
        const t1 = gsap.to(`#${idPrefix}${selectedPiece.id}`, {
            ...moveDistance([selectedPiece.rowIndex || 0, selectedPiece.colIndex || 0], [rowIndex, colIndex]),
            onComplete: () => {
                reverse && t1.reverse()
            }
        })
        const t2 = gsap.to(`#${idPrefix}${piece.id}`, {
            ...moveDistance([rowIndex, colIndex], [selectedPiece?.rowIndex || 0, selectedPiece?.colIndex || 0]),
            onComplete: () => {
                reverse && t2.reverse()
            }
        })
    }

    const handleSwapPiece = contextSafe((piece: Piece, rowIndex: number, colIndex: number) => {
        if (!selectedPiece) {
            console.log('还没选中过棋子')
            return setSelectedPiece({ ...piece, rowIndex, colIndex })
        }
        // 不是相连的棋子不处理
        if (rowIndex !== selectedPiece?.rowIndex && colIndex !== selectedPiece?.colIndex) {
            console.log('不是相连的棋子不处理')
            return
        }
        // 值一样时
        if (piece.value === selectedPiece.value) {
            console.log('值一样，执行交换并还原动画')
            // 执行交换并还原动画
            playAnimation(piece, rowIndex, colIndex)
            setSelectedPiece(null)
            return
        }
        // 值不一样时，执行交换动画，如果交换后无法消除，则还原动画
        console.log('值不一样，执行交换动画')
        const canMatch = window.xiaoxiaole.checkCanMatch([
            [rowIndex, colIndex],
            [selectedPiece.rowIndex, selectedPiece.colIndex]
        ])
        playAnimation(piece, rowIndex, colIndex, !canMatch)

        // window.xiaoxiaole.swapPiece([rowIndex, colIndex], [selectedPiece.rowIndex, selectedPiece.colIndex])
        setSelectedPiece(null)
    })

    return (
        <div>
            <h1 className="text-center text-[40px] mb-[100px]">消消乐</h1>
            <div ref={container} className="overflow-hidden mx-auto flex flex-wrap" style={{ width: row * width }}>
                {chessBoard.map((row: Piece[], rowIndex: number) => {
                    return row.map((col: Piece, colIndex: number) => {
                        return (
                            <Item
                                key={col.id}
                                col={col}
                                rowIndex={rowIndex}
                                colIndex={colIndex}
                                selectedPiece={selectedPiece}
                                handleSwapPiece={handleSwapPiece}
                            />
                        )
                    })
                })}
            </div>
        </div>
    )
}

export default _Xiaoxiaole
