import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'

import { Placeholder } from './components/Placeholder'
import styles from './index.module.scss'
import AppleEmojiPlugin from './plugins/AppleEmojiPlugin'
import { AppleEmojiNode } from './plugins/AppleEmojiPlugin/node'

function onError(error: Error) {
    console.error(error)
}

const Editor = () => {
    const initialConfig: InitialConfigType = {
        namespace: 'yim-editor',
        onError,
        nodes: [AppleEmojiNode]
    }

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className={styles['editor-containter']}>
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable
                            className={styles['editor-inner']}
                            aria-placeholder="请输入内容"
                            placeholder={<Placeholder text="请输入内容" />}
                        />
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin />
                <AutoFocusPlugin />
                <AppleEmojiPlugin />
            </div>
        </LexicalComposer>
    )
}

export default Editor
