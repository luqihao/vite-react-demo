import type { EditorConfig, LexicalNode, NodeKey, SerializedTextNode } from 'lexical'
import { $applyNodeReplacement, TextNode } from 'lexical'

import './emoji_style.css'
import styles from './index.module.scss'
import ImgEmoji from './apple_emoji_sprite.webp'
import { getEmojiClassname } from './utils'

export type SerializedEmojiNode = SerializedTextNode

export class AppleEmojiNode extends TextNode {
    __value: string
    __className: string

    static getType(): string {
        return 'emoji'
    }

    static clone(node: AppleEmojiNode): AppleEmojiNode {
        return new AppleEmojiNode(node.__text, node.__key)
    }

    constructor(emojiText: string, key?: NodeKey) {
        super(emojiText, key)
        this.__value = emojiText
        this.__className = `${styles['emoji']} ${getEmojiClassname(emojiText)}`
    }

    createDOM(config: EditorConfig): HTMLElement {
        // const dom = document.createElement('span')
        const inner = super.createDOM(config)
        inner.className = this.__className
        inner.style.backgroundImage = `url(${ImgEmoji})`
        // dom.appendChild(inner)
        return inner
    }

    updateDOM(prevNode: TextNode, dom: HTMLElement, config: EditorConfig): boolean {
        const inner = dom.firstChild
        if (inner === null) {
            return true
        }
        super.updateDOM(prevNode, inner as HTMLElement, config)
        return false
    }

    static importJSON(serializedNode: SerializedEmojiNode): AppleEmojiNode {
        const node = $createEmojiNode(serializedNode.text)
        node.setFormat(serializedNode.format)
        node.setDetail(serializedNode.detail)
        node.setMode(serializedNode.mode)
        node.setStyle(serializedNode.style)
        return node
    }

    exportJSON(): SerializedEmojiNode {
        return {
            ...super.exportJSON(),
            type: 'emoji'
        }
    }
}

export function $isEmojiNode(node: LexicalNode | null | undefined): node is AppleEmojiNode {
    return node instanceof AppleEmojiNode
}

export function $createEmojiNode(emojiText: string): AppleEmojiNode {
    const node = new AppleEmojiNode(emojiText).setMode('token')
    return $applyNodeReplacement(node)
}
