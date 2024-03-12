import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { useRef } from 'react'

import { Piece, colors } from './Xiaoxiaole'
import { row as rowNum, col as colNum } from './index'

gsap.registerPlugin(useGSAP)

interface IProps {
    col: Piece
    colIndex: number
    rowIndex: number
}

const Item = ({ col, colIndex, rowIndex }: IProps) => {
    const container = useRef<HTMLDivElement>(null)

    useGSAP(
        () => {
            if (col.value === null) {
                gsap.to('.box', {
                    opacity: 0,
                    scale: 0,
                    duration: 1,
                    onComplete: () => console.log(col.id)
                })
            } else {
                gsap.from('.box', {
                    opacity: 0,
                    y: -50 * (rowIndex + 1),
                    duration: 1,
                    ease: 'bounce.out',
                    delay: (rowNum + (colNum ? colNum : 0) - (colIndex + rowIndex)) * 0.1
                })
            }
        },
        {
            scope: container,
            dependencies: [col.value]
        }
    )
    return (
        <div
            id={col.id.toString()}
            data-row={rowIndex}
            data-col={colIndex}
            className=" opacity-100 w-[50px] h-[50px] box-border flex items-center justify-center border p-[4px]"
            ref={container}
        >
            <div
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
