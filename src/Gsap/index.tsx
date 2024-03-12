import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

import './App.css'

function App() {
    useEffect(() => {
        // gsap.to('.box', {
        //     scrollTrigger: '.box',
        //     x: 500,
        //     background: 'blue',
        //     rotate: 76,
        //     ease: 'bounce',
        //     duration: 1
        //     // repeat: 1,
        //     // yoyo: true
        // })
        timeline()
    }, [])

    const set = () => {
        gsap.set('.box', {
            x: 200,
            background: 'orange',
            duration: 2,
            rotate: 178
        })
    }

    const swagger = () => {
        gsap.to('.box', {
            duration: 0.5,
            opacity: 0,
            y: 100,
            stagger: 0.5,
            ease: 'back.in'
        })
    }

    const timeline = () => {
        gsap.timeline()
            .to(
                '.box1',
                {
                    scrollTrigger: '.box1',
                    x: 300,
                    background: 'pink',
                    duration: 3
                },
                1
            )
            .to(
                '.box2',
                {
                    scrollTrigger: '.box2',
                    x: 300,
                    background: 'purple',
                    duration: 2
                    // delay: 1
                },
                '<'
            )
            .to(
                '.box3',
                {
                    scrollTrigger: '.box3',
                    x: 300,
                    background: 'green',
                    duration: 1
                },
                '+=0'
            )
            .to(
                '.box3',
                {
                    y: 50,
                    background: 'yellow',
                    duration: 1,
                    delay: 0.5
                },
                '+=0'
            )
    }

    const scrollto = () => {
        gsap.to(window, { duration: 2, scrollTo: '.box3' })
    }

    return (
        <div>
            <div style={{ marginBottom: 20, height: 1000 }}>
                <button onClick={set}>gsap.set</button>
                <button onClick={timeline}>timeline</button>
                <button onClick={scrollto}>scrollto</button>
            </div>
            <div className="box box1" onClick={swagger}></div>
            <div className="box box2" onClick={swagger}></div>
            <div className="box box3" onClick={swagger}></div>
            <div></div>
        </div>
    )
}

export default App
