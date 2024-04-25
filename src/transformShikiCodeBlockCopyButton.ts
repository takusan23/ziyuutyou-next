import { ShikiTransformer } from 'shiki/types.mjs'

/** コピーボタンにつける Tailwind CSS のユーティリティ名 */
const className = 'hidden group-hover:flex p-2 m-2 absolute top-0 right-0 cursor-pointer rounded-md bg-background-dark border-2 border-content-primary-dark text-content-primary-dark fill-content-primary-dark'

/**
 * rehype-pretty-code の中で使っている shiki へコードブロックのコピーボタンを差し込むようにするやつ
 * 参考：
 * https://github.com/rehype-pretty/rehype-pretty-code/blob/master/packages/transformers/src/copy-button.ts
 * 
 * API：
 * https://shiki.matsu.io/guide/transformers
 * 
 * @returns rehype-pretty-code の transformers へこの関数を渡してください 
 */
export default function transformShikiCodeBlockCopyButton(): ShikiTransformer {
    return {
        name: 'transformShikiCodeBlockCopyButton',

        // 生成後の <pre> 要素を編集する
        pre(node) {

            // コピーボタンを追加するためにまず親を position: relative する
            // src の中ですが、このファイルだけ特別にユーティリティ名走査対象にしているので Tailwind CSS が使えます。
            node.properties.class = 'relative group'

            // コピーボタンを差し込む
            node.children.push({
                type: 'element',
                tagName: 'div',
                properties: {
                    data: this.source,
                    onclick: /* javascript */ `navigator.clipboard.writeText(this.attributes.data.value)`,
                    class: className,
                },
                children: [
                    {
                        type: 'element',
                        tagName: 'svg',
                        properties: {
                            xmlns: 'http://www.w3.org/2000/svg',
                            height: '24',
                            viewBox: '0 -960 960 960',
                            width: '24'
                        },
                        children: [
                            {
                                type: 'element',
                                tagName: 'path',
                                properties: {
                                    // アイコンは https://fonts.google.com/icons より
                                    d: 'M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h167q11-35 43-57.5t70-22.5q40 0 71.5 22.5T594-840h166q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560h-80v120H280v-120h-80v560Zm280-560q17 0 28.5-11.5T520-800q0-17-11.5-28.5T480-840q-17 0-28.5 11.5T440-800q0 17 11.5 28.5T480-760Z'
                                },
                                children: []
                            }
                        ]
                    }
                ],
            });
        }
    };
}
