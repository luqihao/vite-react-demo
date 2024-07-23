import { useEffect, useRef, useState } from 'react'

import Xiaoxiaole from './Xiaoxiaole'

const id = 'xiaoxiaole'

const REST_TIME = 0
const NewXiaoxiaole = () => {
    const ref = useRef<Xiaoxiaole>()
    const [maxCombo, setMaxCombo] = useState<number>(0)
    const [score, setScore] = useState<number>(0)
    const [start, setStart] = useState<boolean>(false)
    const [restTime, setRestTime] = useState<number>(REST_TIME)

    const startGame = () => {
        setStart(true)
        ref.current = new Xiaoxiaole({
            containerId: id,
            row: 8,
            col: 8,
            pieceSize: 50,
            restTime: REST_TIME,
            handleScoreChange: setScore,
            handleMaxComboChange: setMaxCombo,
            handleRestTimeChange: setRestTime,
            handleGameOver: () => setStart(false)
        })
    }

    useEffect(() => {
        return () => {
            ref.current?.resetData()
        }
    }, [])

    return (
        <>
            {start ? (
                <div style={{ margin: '100px auto 10px', width: 8 * 50 }}>
                    <div>当前分数：{score}</div>
                    <div>最大连击数：{maxCombo}</div>
                    <div>剩余秒数：{restTime}</div>
                </div>
            ) : (
                <div style={{ margin: '100px auto 10px', textAlign: 'center' }}>
                    <button style={{ border: '1px solid #000', padding: 4 }} onClick={startGame}>
                        游戏开始
                    </button>
                </div>
            )}
            <div
                id={id}
                style={{
                    width: 8 * 50,
                    height: 8 * 50,
                    position: 'relative',
                    margin: `0 auto`,
                    overflow: 'hidden'
                }}
            ></div>
        </>
    )
}

export default NewXiaoxiaole
