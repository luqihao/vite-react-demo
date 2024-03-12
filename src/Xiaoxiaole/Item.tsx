import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { useRef } from 'react'

import { colors } from './Xiaoxiaole'
import { row as rowNum, col as colNum } from './index'

gsap.registerPlugin(useGSAP)

interface IProps {
    col: number | null
    colIndex: number
    rowIndex: number
}

const Item = ({ col, colIndex, rowIndex }: IProps) => {
    const container = useRef<HTMLDivElement>(null)

    useGSAP(
        () => {
            gsap.from('.box', {
                opacity: 0,
                y: -50 * (rowIndex + 1),
                duration: 1,
                ease: 'bounce.out',
                delay: (rowNum + (colNum ? colNum : 0) - (colIndex + rowIndex)) * 0.1
            })
        },
        { scope: container }
    )
    return (
        <div
            id={col + ',' + colIndex}
            data-row={rowIndex}
            data-col={colIndex}
            className=" opacity-100 w-[50px] h-[50px] box-border flex items-center justify-center border p-[4px]"
            ref={container}
        >
            <div
                className="box w-full h-full text-white flex items-center justify-center"
                style={{ background: col ? colors[col - 1] : '#fff' }}
            >
                {rowIndex}-{colIndex}
            </div>
        </div>
    )
}

export default Item
