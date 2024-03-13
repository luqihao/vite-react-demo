import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { useRef } from 'react'

import { Piece, colors } from './Xiaoxiaole'
import { row as rowNum, col as colNum, width, padding, idPrefix } from './index'

gsap.registerPlugin(useGSAP)

interface IProps {
    col: Piece
    colIndex: number
    rowIndex: number
    selectedPiece: Piece | null
    handleSwapPiece: (piece: Piece, rowIndex: number, colIndex: number) => void
}

const Item = ({ col, colIndex, rowIndex, selectedPiece, handleSwapPiece }: IProps) => {
    const container = useRef<HTMLDivElement>(null)

    useGSAP(
        () => {
            gsap.from(`#${idPrefix}${col.id}`, {
                opacity: 0,
                y: -width * (rowIndex + 1),
                duration: 1,
                ease: 'bounce.out',
                delay: (rowNum + (colNum ? colNum : 0) - (colIndex + rowIndex)) * 0.1
            })
        },
        {
            scope: container
        }
    )

    return (
        <div
            className=" opacity-100 w-[50px] h-[50px] box-border flex items-center justify-center border "
            style={{ backgroundColor: selectedPiece?.id === col.id ? 'yellow' : '#fff', padding }}
            ref={container}
            onClick={() => handleSwapPiece(col, rowIndex, colIndex)}
        >
            <div
                id={idPrefix + col.id.toString()}
                data-row={rowIndex}
                data-col={colIndex}
                className="box w-full h-full text-white flex items-center justify-center"
                style={{ background: col.value ? colors[col.value - 1] : '#fff' }}
            >
                {/* {rowIndex}-{colIndex} */}
                {col.id}
            </div>
        </div>
    )
}

export default Item
