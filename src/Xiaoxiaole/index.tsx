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

export function wait(time = 0): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}

const _Xiaoxiaole = () => {
    const [chessBoard, setChessBoard] = useState<ChessBoard>([])
    const [selectedPiece, setSelectedPiece] = useState<Required<Piece> | null>(null)
    const [mounted, setMounted] = useState<boolean>(false)
    const animationList = useRef<gsap.core.Tween[]>([])

    const container = useRef<HTMLDivElement>(null)

    useGSAP({ scope: container })

    useEffect(() => {
        if (chessBoard.length < 1 || mounted) {
            return
        }
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                gsap.fromTo(
                    `#${idPrefix}${chessBoard[i][j].id}`,
                    {
                        opacity: 0,
                        y: -width * (i + 1)
                    },
                    {
                        opacity: 1,
                        y: 0,
                        delay: (row + (col ? col : 0) - (j + i)) * 0.1,
                        ease: 'bounce.out'
                    }
                )
            }
        }
        setMounted(true)
    }, [chessBoard, mounted])

    const moveDistance = ([originRow, originCol]: [number, number], [targetRow, targetCol]: [number, number]) => {
        if (originRow === targetRow) {
            return originCol > targetCol ? { translateX: -width } : { translateX: width }
        }

        if (originCol === targetCol) {
            return originRow > targetRow ? { translateY: -width } : { translateY: width }
        }

        return {}
    }

    // 执行交换棋子动画
    const playExchangeAnimation = (piece: Piece, rowIndex: number, colIndex: number, reverse = true) => {
        if (!selectedPiece) {
            return
        }
        const t1 = gsap.to(`#${idPrefix}${selectedPiece.id}`, {
            ...moveDistance([selectedPiece.rowIndex || 0, selectedPiece.colIndex || 0], [rowIndex, colIndex]),
            onComplete: () => {
                reverse && t1.reverse(0)
            }
        })
        const t2 = gsap.to(`#${idPrefix}${piece.id}`, {
            ...moveDistance([rowIndex, colIndex], [selectedPiece?.rowIndex || 0, selectedPiece?.colIndex || 0]),
            onComplete: () => {
                reverse && t2.reverse(0)
            }
        })
        animationList.current = [t1, t2]
    }

    // 执行消除棋子动画
    const playRemoveAnimation = async (list: ChessBoard, pos: number[]) => {
        const [row, col] = pos
        if (animationList.current.length > 0) {
            animationList.current.forEach((animate: gsap.core.Tween) => {
                animate.reverse(0)
            })
            animationList.current = []
        }
        await wait(16)
        gsap.to(`#${idPrefix}${list[row][col].id}`, {
            opacity: 0.3,
            scale: 0.5
        })
    }

    const handleSwapPiece = async (piece: Piece, rowIndex: number, colIndex: number) => {
        if (!selectedPiece) {
            console.log('还没选中过棋子')
            return setSelectedPiece({ ...piece, rowIndex, colIndex })
        }

        // 不是相连的棋子不处理
        if (rowIndex !== selectedPiece?.rowIndex && colIndex !== selectedPiece?.colIndex) {
            console.log('不是相连的棋子, 设置新选中的棋子')
            return setSelectedPiece({ ...piece, rowIndex, colIndex })
        }

        if (selectedPiece.id === piece.id) {
            console.log('选中了自己，不处理')
            return
        }

        // 值一样时
        if (piece.value === selectedPiece.value) {
            console.log('值一样，执行交换并还原动画')
            // 执行交换并还原动画
            playExchangeAnimation(piece, rowIndex, colIndex)
            setSelectedPiece(null)
            return
        }

        // 值不一样时，执行交换动画，如果交换后无法消除，则还原动画
        console.log('值不一样，执行交换动画')
        // 执行消除动作时的动画操作的都应该时假交换后的数组
        // 先进行假交换
        const newChessBoard: ChessBoard = window.xiaoxiaole.swapPiece(
            chessBoard,
            [selectedPiece.rowIndex, selectedPiece.colIndex],
            [rowIndex, colIndex]
        )
        // 根据交换后的数组检测是否能进行消除
        const matchedPieces: number[][] = window.xiaoxiaole.checkMatchedPieces(newChessBoard, [
            [selectedPiece.rowIndex, selectedPiece.colIndex],
            [rowIndex, colIndex]
        ])
        const canRemove = matchedPieces.length > 0
        console.log('是否可以进行消除', canRemove, matchedPieces)
        playExchangeAnimation(piece, rowIndex, colIndex, !canRemove)

        // 能消除的话就执行消除动画
        if (canRemove) {
            await wait(500)
            // playRemoveAnimation(newChessBoard, matchedPieces)
            // await wait(500)
            window.xiaoxiaole._swapPiece([selectedPiece.rowIndex, selectedPiece.colIndex], [rowIndex, colIndex])
        }

        setSelectedPiece(null)
    }

    useEffect(() => {
        if (window.xiaoxiaole) {
            return
        }
        window.xiaoxiaole = new Xiaoxiaole({
            row,
            col,
            handleChessboardChange: setChessBoard,
            handleGameOver: () => alert('游戏结束'),
            handleRemovePiece: playRemoveAnimation
        })
    }, [])

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
                                mounted={mounted}
                            />
                        )
                    })
                })}
            </div>
        </div>
    )
}

export default _Xiaoxiaole
