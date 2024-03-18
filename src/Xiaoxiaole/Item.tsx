import { useDrag } from 'ahooks'
import { useRef } from 'react'

import { Piece, colors } from './Xiaoxiaole'
import { padding, idPrefix } from './index'

interface IProps {
    col: Piece
    colIndex: number
    rowIndex: number
    selectedPiece: Piece | null
    handlePieceClick: (piece: Piece, rowIndex: number, colIndex: number) => void
    mounted: boolean
}

const Item = ({ col, colIndex, rowIndex, selectedPiece, handlePieceClick, mounted }: IProps) => {
    const dragRef = useRef(null)
    useDrag(col.id, dragRef, {
        onDragStart: e => {
            console.log('onDragStart', e)
        }
    })
    return (
        <div
            className=" opacity-100 w-[50px] h-[50px] box-border flex items-center justify-center border "
            style={{ backgroundColor: selectedPiece?.id === col.id ? '#000' : '#fff', padding }}
            // onClick={() => {
            //     console.log('onClick')
            //     handlePieceClick(col, rowIndex, colIndex)
            // }}
            onTouchStart={() => handlePieceClick(col, rowIndex, colIndex)}
        >
            <div
                ref={dragRef}
                id={idPrefix + col.id.toString()}
                className="box w-full h-full text-white flex items-center justify-center select-none"
                style={{
                    background: col.value ? colors[col.value - 1] : '#fff',
                    display: mounted ? 'flex' : 'none',
                    opacity: col?.isFill ? 0 : 1
                }}
            >
                {/* {rowIndex}-{colIndex} */}
                {col.id}
            </div>
        </div>
    )
}

export default Item
