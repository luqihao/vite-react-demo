import styles from './index.module.scss'

export function Placeholder({ text }: { text: string }) {
    return <div className={styles['placeholder']}>{text}</div>
}
