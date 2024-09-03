import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'

import { Placeholder } from './components/Placeholder'
import styles from './index.module.scss'
import EmojiPlugin from './plugins/EmojiPlugin'
import { EmojiNode } from './plugins/EmojiPlugin/node'

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error) {
    console.error(error)
}

const Editor = () => {
    const initialConfig: InitialConfigType = {
        namespace: 'yim-editor',
        onError,
        nodes: [EmojiNode]
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
                <EmojiPlugin />
            </div>
        </LexicalComposer>
    )
}

export default Editor
