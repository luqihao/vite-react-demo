import { useEffect, useRef, useState } from 'react'

import Xiaoxiaole from './Xiaoxiaole'

const id = 'xiaoxiaole'
const NewXiaoxiaole = () => {
    const ref = useRef<Xiaoxiaole>()
    const [maxCombo, setMaxCombo] = useState<number>(0)
    const [combo, setCombo] = useState<number>(0)
    const [score, setScore] = useState<number>(0)

    useEffect(() => {
        if (ref.current) {
            return
        }
        ref.current = new Xiaoxiaole({
            containerId: id,
            row: 8,
            col: 8,
            pieceSize: 50,
            handleScoreChange: setScore,
            handleComboChange: setCombo,
            handleMaxComboChange: setMaxCombo
        })
    }, [])

    return (
        <>
            <div style={{ margin: '0 auto', display: 'inline-block', width: 8 * 50 }}>
                <div>当前分数：{score}</div>
                <div>当前连击数：{combo}</div>
                <div>最大连击数：{maxCombo}</div>
            </div>
            <div
                id={id}
                style={{
                    width: 8 * 50,
                    height: 8 * 50,
                    position: 'relative',
                    margin: `100px auto`,
                    overflow: 'hidden'
                }}
            ></div>
        </>
    )
}

export default NewXiaoxiaole
