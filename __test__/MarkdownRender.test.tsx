import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import MarkdownRender from '../components/markdownrender/MarkdownRender'
import { act, Suspense } from 'react'

/** npm run test で実行できます */
describe('<MarkdownRender /> のテスト', () => {

    // テスト実行で一回だけ
    beforeAll(() => {
        // next/font がエラーになるのでモック
        vi.mock('next/font/local', () => ({
            default: () => ({ className: '', style: { fontFamily: '' }, variable: '' })
        }))
    })

    // 前回の render() 結果が消えるように
    afterEach(() => {
        cleanup()
    });

    test('文字が描画できる', async () => {
        // よく分からないですが、act() + <Suspense> で async function もテストできた
        // https://github.com/testing-library/react-testing-library/issues/1209
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown='text' />
                </Suspense>
            )
        })
        expect(screen.getByText('text')).toBeDefined()
        expect(screen.getByText('text').tagName).toBe('P')
    })

    test('太字が描画できる', async () => {
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown='**strong**' />
                </Suspense>
            )
        })
        expect(screen.getByRole('strong')).toBeDefined()
    })

    test('打ち消し線が描画出来る', async () => {
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown='~~del~~' />
                </Suspense>
            )
        })
        expect(screen.getByText('del').tagName).toBe('DEL')
    })

    test('斜線が描画できる', async () => {
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown='*em*' />
                </Suspense>
            )
        })
        expect(screen.getByText('em').tagName).toBe('EM');
    })

    test('<p> が描画できる', async () => {
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown='<p>p</p>' />
                </Suspense>
            )
        })
        expect(screen.getByText('p')).toBeDefined()
        expect(screen.getByText('p').tagName).toBe('P')
    })

    test('<span> が描画できる', async () => {
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown='<span>span</span>' />
                </Suspense>
            )
        })
        expect(screen.getByText('span')).toBeDefined()
        expect(screen.getByText('span').tagName).toBe('SPAN')
    })

    test('<sup> が描画できる', async () => {
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown='<sup>sup</sup>' />
                </Suspense>
            )
        })
        expect(screen.getByText('sup')).toBeDefined()
        expect(screen.getByText('sup').tagName).toBe('SUP')
    })

    test('改行できる', async () => {
        // querySelector は最終手段
        const { container } = await act(async () => {
            return render(
                <Suspense>
                    <MarkdownRender markdown={`separator  
    separator`} />
                </Suspense>
            )
        })
        expect(container.querySelector('br')).toBeDefined()
    })

    test('リンクが描画できる', async () => {
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown='[トップ](https://takusan.negitoro.dev/)' />
                </Suspense>
            )
        })
        expect(screen.getByRole('link')).toBeDefined()
        expect(screen.getByRole('link').textContent).toBe('トップ')
        expect(screen.getByRole('link')).toHaveProperty('href', 'https://takusan.negitoro.dev/')
        // リンクカードがないこと
        expect(screen.queryAllByRole('img').length).toBe(0)
    })

    test('リンクカードの取得に失敗した', async () => {
        // fetch をわざと失敗させる
        const spy = vi
            .spyOn(global, 'fetch')
            .mockRejectedValue(new Error('mock!!!'))

        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown='https://takusan.negitoro.dev/' />
                </Suspense>
            )
        })
        expect(screen.getByRole('link').textContent).toBe('https://takusan.negitoro.dev/')
        expect(screen.getByRole('link')).toBeDefined()
        expect(screen.getByRole('link')).toHaveProperty('href', 'https://takusan.negitoro.dev/')

        // 戻す
        spy.mockRestore()
    })

    test('リンクカードの取得に成功した', async () => {
        // fetch を成功させる
        const html = `
        <html>
            <head>
                <meta property="og:title" content="Hello Android 15。16KB ページサイズ編 - たくさんの自由帳">
                <meta property="og:url" content="https://takusan.negitoro.dev/posts/android_15_16kb_page_size/">
                <meta property="og:image" content="https://takusan.negitoro.dev/posts/android_15_16kb_page_size/opengraph-image.png">   
            </head>
        </html>
        `
        const spy = vi
            .spyOn(global, 'fetch')
            .mockResolvedValue(new Response(html))

        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown='https://takusan.negitoro.dev/' />
                </Suspense>
            )
        })
        expect(screen.getByText('Hello Android 15。16KB ページサイズ編 - たくさんの自由帳')).toBeDefined()
        expect(screen.getByRole('link')).toBeDefined()
        expect(screen.getByRole('link')).toHaveProperty('href', 'https://takusan.negitoro.dev/')
        expect(screen.getByRole('img')).toBeDefined()
        expect(screen.getByRole('img')).toHaveProperty('src', 'https://takusan.negitoro.dev/posts/android_15_16kb_page_size/opengraph-image.png')

        spy.mockRestore()
    })

    test('<section> を描画できる', async () => {
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown='<section>section</section>' />
                </Suspense>
            )
        })
        expect(screen.getByText('section')).toBeDefined()
    })

    test('引用できる', async () => {
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown='> blockquote' />
                </Suspense>
            )
        })
        expect(screen.getByRole('blockquote')).toBeDefined()
    })

    test('折りたたみ要素が描画できる', async () => {
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown={`
<details>
<summary>展開</summary>
折りたたみ
</details>
                    `} />
                </Suspense>
            )
        })
        expect(screen.getByRole('group')).toBeDefined()
        expect(screen.getByText('展開')).toBeDefined()
        expect(screen.getByText('折りたたみ')).toBeDefined()
    })

    test('区切り線が描画出来る', async () => {
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown='---' />
                </Suspense>
            )
        })
        expect(screen.getByRole('separator')).toBeDefined()
    })

    test('画像が描画できる', async () => {
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown='![Icon](https://takusan.negitoro.dev/icon.png)' />
                </Suspense>
            )
        })
        expect(screen.getByRole('img')).toBeDefined()
        expect(screen.getByRole('img')).toHaveProperty('src', 'https://takusan.negitoro.dev/icon.png')
    })

    test('箇条書きが描画できる', async () => {
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown={`
- 2025
    - Android 16
    - iOS 16
`} />
                </Suspense>
            )
        })
        expect(screen.getByText('2025')).toBeDefined()
        expect(screen.getByText('Android 16')).toBeDefined()
        expect(screen.getByText('iOS 16')).toBeDefined()
        expect(screen.getAllByRole('listitem').length).toBe(3)
    })

    test('テーブルが描画できる', async () => {
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown={`
| key | value |
|---|---|
| Android | 16 |                        
                        `} />
                </Suspense>
            )
        })
        expect(screen.getByText('key')).toBeDefined()
        expect(screen.getByText('value')).toBeDefined()
        expect(screen.getByText('Android')).toBeDefined()
        expect(screen.getByText('16')).toBeDefined()
        expect(screen.getByRole('table')).toBeDefined()
    })

    test('見出しが描画できる', async () => {
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown={`
# h1
## h2
### h3
#### h4
##### h5
###### h6
`} />
                </Suspense>
            )
        })
        expect(screen.getByRole('heading', { level: 1 })).toBeDefined()
        expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('h1')
        expect(screen.getByRole('heading', { level: 2 })).toBeDefined()
        expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('h2')
        expect(screen.getByRole('heading', { level: 3 })).toBeDefined()
        expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('h3')
        expect(screen.getByRole('heading', { level: 4 })).toBeDefined()
        expect(screen.getByRole('heading', { level: 4 }).textContent).toBe('h4')
        expect(screen.getByRole('heading', { level: 5 })).toBeDefined()
        expect(screen.getByRole('heading', { level: 5 }).textContent).toBe('h5')
        expect(screen.getByRole('heading', { level: 6 })).toBeDefined()
        expect(screen.getByRole('heading', { level: 6 }).textContent).toBe('h6')
    })

    test('コードブロックが描画出来る', async () => {
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown={`
                        \`\`\`ts
                        console.log('Hello World')
                        \`\`\`
                    `} />
                </Suspense>
            )
        })
        expect(screen.getByText(`console.log('Hello World')`)).toBeDefined()
        expect(screen.getByRole('code')).toBeDefined()
    })

    test('<code> が描画できる', async () => {
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown='`Hello World`' />
                </Suspense>
            )
        })
        expect(screen.getByText('Hello World')).toBeDefined()
        expect(screen.getByRole('code')).toBeDefined()
    })

    test('<script> が挿入される', async () => {
        const { container } = await act(async () => {
            return render(
                <Suspense>
                    <MarkdownRender markdown='<script> alert("hello world") </script>' />
                </Suspense>
            )
        })
        expect(container.querySelector('script')).toBeDefined()
    })

    test('<iframe> が挿入される', async () => {
        const { container } = await act(async () => {
            return render(
                <Suspense>
                    <MarkdownRender markdown='<iframe />' />
                </Suspense>
            )
        })
        expect(container.querySelector('iframe')).toBeDefined()
    })

    test('自前で描画しないタグも描画できる', async () => {
        const { container } = await act(async () => {
            return render(
                <Suspense>
                    <MarkdownRender markdown='<video src="https://example.com"></video>' />
                </Suspense>
            )
        })
        expect(container.querySelector('video')).toBeDefined()
    })

    test('HTML に style が書かれていたら自分で描画するのを辞める', async () => {
        const { container } = await act(async () => {
            return render(
                <Suspense>
                    <MarkdownRender markdown='<span style="color:red">styleを書いている<span/>' />
                </Suspense>
            )
        })
        // unified を使う場合 div でラップされる
        expect(container.querySelector('div span')).toBeDefined()
    })

    /*
        test('', async () => {
            await act(async () => {
                render(
                    <Suspense>
                        <MarkdownRender markdown='' />
                    </Suspense>
                )
            })
            expect(screen.getByRole('')).toBeDefined()
        })
    */

})
