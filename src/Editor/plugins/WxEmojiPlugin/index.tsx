import type { LexicalEditor } from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { TextNode } from 'lexical'
import { useEffect } from 'react'

import { $createEmojiNode, WxEmojiNode } from './node'
export const WX_EMOJI_REG =
    /\[微笑\]|\[撇嘴\]|\[色\]|\[发呆\]|\[得意\]|\[流泪\]|\[害羞\]|\[闭嘴\]|\[睡\]|\[大哭\]|\[尴尬\]|\[发怒\]|\[调皮\]|\[呲牙\]|\[惊讶\]|\[难过\]|\[囧\]|\[抓狂\]|\[吐\]|\[偷笑\]|\[愉快\]|\[白眼\]|\[傲慢\]|\[困\]|\[惊恐\]|\[流汗\]|\[憨笑\]|\[悠闲\]|\[奋斗\]|\[咒骂\]|\[疑问\]|\[嘘\]|\[晕\]|\[衰\]|\[骷髅\]|\[敲打\]|\[再见\]|\[擦汗\]|\[抠鼻\]|\[鼓掌\]|\[坏笑\]|\[左哼哼\]|\[右哼哼\]|\[哈欠\]|\[鄙视\]|\[委屈\]|\[快哭了\]|\[阴险\]|\[亲亲\]|\[可怜\]|\[菜刀\]|\[西瓜\]|\[啤酒\]|\[咖啡\]|\[猪头\]|\[玫瑰\]|\[凋谢\]|\[嘴唇\]|\[爱心\]|\[心碎\]|\[蛋糕\]|\[炸弹\]|\[便便\]|\[月亮\]|\[太阳\]|\[拥抱\]|\[强\]|\[弱\]|\[握手\]|\[胜利\]|\[抱拳\]|\[勾引\]|\[拳头\]|\[OK\]|\[跳跳\]|\[发抖\]|\[怄火\]|\[转圈\]|\[高兴\]|\[口罩\]|\[笑哭\]|\[吐舌头\]|\[傻呆\]|\[恐惧\]|\[悲伤\]|\[不屑\]|\[嘿哈\]|\[捂脸\]|\[奸笑\]|\[机智\]|\[皱眉\]|\[耶\]|\[吃瓜\]|\[力量\]|\[汗\]|\[天啊\]|\[Emm\]|\[社会社会\]|\[旺柴\]|\[好的\]|\[打脸\]|\[哇\]|\[鬼脸\]|\[合十\]|\[加油\]|\[庆祝\]|\[礼物\]|\[红包\]|\[發\]|\[福\]|\[Tea\]|\[小狗\]|\[蜡烛\]|\[小鸡\]|\[加油加油\]|\[翻白眼\]|\[666\]|\[让我看看\]|\[叹气\]|\[苦涩\]|\[裂开\]/g

function $findAndTransformEmoji(node: TextNode): null | TextNode {
    const text = node.getTextContent()

    const arr = text.match(WX_EMOJI_REG) || []
    for (let i = 0; i < arr.length; i++) {
        const emoji = arr[i]
        const index = text.indexOf(emoji)
        let targetNode
        if (index === 0) {
            ;[targetNode] = node.splitText(emoji.length)
        } else {
            ;[, targetNode] = node.splitText(index, index + emoji.length)
        }
        const emojiNode = $createEmojiNode(emoji)
        targetNode.replace(emojiNode)
        return emojiNode
    }

    return null
}

function $textNodeTransform(node: TextNode): void {
    let targetNode: TextNode | null = node

    while (targetNode !== null) {
        if (!targetNode.isSimpleText()) {
            return
        }

        targetNode = $findAndTransformEmoji(targetNode)
    }
}

function useEmojis(editor: LexicalEditor): void {
    useEffect(() => {
        if (!editor.hasNodes([WxEmojiNode])) {
            throw new Error('EmojiPlugin: WxEmojiNode not registered on editor')
        }

        return editor.registerNodeTransform(TextNode, $textNodeTransform)
    }, [editor])
}

export default function EmojiPlugin(): JSX.Element | null {
    const [editor] = useLexicalComposerContext()

    useEmojis(editor)

    return null
}
