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
    return (
        <div
            className=" opacity-100 w-[50px] h-[50px] box-border flex items-center justify-center border "
            style={{ backgroundColor: selectedPiece?.id === col.id ? '#000' : '#fff', padding }}
            onClick={() => handlePieceClick(col, rowIndex, colIndex)}
        >
            <div
                id={idPrefix + col.id.toString()}
                className="box w-full h-full text-white flex items-center justify-center"
                style={{
                    background: col.value ? colors[col.value - 1] : '#fff',
                    display: mounted && !col?.isFill ? 'flex' : 'none'
                }}
            >
                {/* {rowIndex}-{colIndex} */}
                {col.id}
            </div>
        </div>
    )
}

export default Item
