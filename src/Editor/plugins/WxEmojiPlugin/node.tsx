import type { EditorConfig, LexicalNode, NodeKey, SerializedTextNode, Spread } from 'lexical'
import { $applyNodeReplacement, TextNode } from 'lexical'

import styles from './index.module.scss'

export type SerializedEmojiNode = Spread<{ value: string; className: string }, SerializedTextNode>

export class WxEmojiNode extends TextNode {
    __value: string
    __className: string

    static getType(): string {
        return 'wx-emoji'
    }

    static clone(node: WxEmojiNode): WxEmojiNode {
        return new WxEmojiNode(node.__value, node.__key)
    }

    constructor(emojiText: string, key?: NodeKey) {
        super(emojiText, key)
        this.__value = emojiText
        this.__className = styles['wx-emoji']
    }

    createDOM(config: EditorConfig): HTMLElement {
        const inner = super.createDOM(config)
        inner.className = this.__className
        inner.style.backgroundImage = `url(./wx/${this.__value}.png)`
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

    static importJSON(serializedNode: SerializedEmojiNode): WxEmojiNode {
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
            value: this.__value,
            className: this.__className,
            type: 'apple-emoji'
        }
    }
}

export function $isEmojiNode(node: LexicalNode | null | undefined): node is WxEmojiNode {
    return node instanceof WxEmojiNode
}

export function $createEmojiNode(emojiText: string): WxEmojiNode {
    const node = new WxEmojiNode(emojiText).setMode('token')
    return $applyNodeReplacement(node)
}
