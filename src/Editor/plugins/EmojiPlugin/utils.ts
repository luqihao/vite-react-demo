// 来自https://github.com/twitter/twemoji-parser/blob/master/src/index.js
const vs16RegExp = /\uFE0F/g
const zeroWidthJoiner = String.fromCharCode(0x200d)
const removeVS16s = (rawEmoji: string) =>
    rawEmoji.indexOf(zeroWidthJoiner) < 0 ? rawEmoji.replace(vs16RegExp, '') : rawEmoji
function toCodePoints(unicodeSurrogates: string): Array<string> {
    const points = []
    let char = 0
    let previous = 0
    let i = 0
    while (i < unicodeSurrogates.length) {
        char = unicodeSurrogates.charCodeAt(i++)
        if (previous) {
            points.push((0x10000 + ((previous - 0xd800) << 10) + (char - 0xdc00)).toString(16))
            previous = 0
        } else if (char > 0xd800 && char <= 0xdbff) {
            previous = char
        } else {
            points.push(char.toString(16))
        }
    }
    return points
}

export const getEmojiClassname = (val: string) => {
    return 'emoji-' + toCodePoints(removeVS16s(val)).join('-')
}
