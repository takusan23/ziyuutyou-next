import { ImageResponse } from "next/og"
import ContentFolderManager from "../../../../src/ContentFolderManager"
import resolveConfig from "tailwindcss/resolveConfig"
import tailwindConfig from "../../../../tailwind.config.js"
import EnvironmentTool from "../../../../src/EnvironmentTool"
import FileReadTool from "../../../../src/FileReadTool"

/** 動的ルーティング */
type PageProps = {
    params: Promise<{ blog: string }>
}

/**
 * OGP 画像を生成するルートハンドラー
 * OGP 画像を静的書き出し時に生成するため、request 引数は使ってはいけない。
 * 
 * 使える CSS は以下参照：
 * https://github.com/vercel/satori
 */
export async function GET(_: Request, props: PageProps) {
    const params = await props.params;
    // 記事を取得
    const markdownData = await ContentFolderManager.getBlogItem(params.blog)

    // Tailwind CSS の色を取得
    const colors = resolveConfig(tailwindConfig).theme?.colors
    const backgroundColor = colors['background']['light']
    const containerColor = colors['container']['primary']['light']
    const contentColor = colors['content']['primary']['light']

    // 表示するアイコン。base64 とかで直接渡すのがいいらしい（相対 URL 無理だった）
    const [iconBase64, homeIconBase64, blogIconBase64, tagIconBase64, fontFileBuffer] = await Promise.all([
        // アバター画像。/app/icon.png
        FileReadTool.readBase64('app', 'icon.png'),
        // ナビゲーションドロワーのアイコン
        FileReadTool.readTextFile('public', 'icon', 'home.svg'),
        FileReadTool.readTextFile('public', 'icon', 'book.svg'),
        FileReadTool.readTextFile('public', 'icon', 'sell.svg'),
        // フォントファイル
        // styles/css/fonts にある ttf を見に行く
        FileReadTool.readByteArray('styles', 'css', 'fonts', 'Koruri-Regular.ttf')
    ])

    return new ImageResponse(
        (
            // 背景
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    position: 'relative',
                    display: 'flex',
                    backgroundColor: backgroundColor,
                    fontFamily: 'KoruriFont'
                }}
            >

                {/* flex 横並び。 */}
                {/* パーセントで仕切るんじゃなくて、flex-grow 使うべきな気がするけど、width 明示的に指定しないとテキストの折り返し出来ない気がして、、 */}
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        position: 'absolute',
                        display: 'flex',
                        flexDirection: 'row'
                    }}
                >

                    {/* アイコン並んでる部分 */}
                    <div
                        style={{
                            width: '10%',
                            display: 'flex',
                            flexDirection: 'column',
                            marginTop: 20,
                            alignItems: 'center'
                        }}
                    >
                        {/* アバター画像 */}
                        <img
                            style={{ borderRadius: 50 }}
                            width={70}
                            height={70}
                            src={`${FileReadTool.BASE64_PREFIX_PNG}${iconBase64}`}
                        />

                        {/* ナビゲーションドロワーのアイコン並んでる部分 */}
                        {
                            [homeIconBase64, blogIconBase64, tagIconBase64].map((svg) => (
                                <img
                                    style={{ marginTop: 40 }}
                                    width={50}
                                    height={50}
                                    src={`${FileReadTool.BASE64_PREFIX_SVG}${svg}`}
                                />
                            ))
                        }
                    </div>

                    {/* flex 縦並び */}
                    <div
                        style={{
                            width: '90%',
                            display: 'flex',
                            flexDirection: 'column',
                            paddingRight: 30
                        }}
                    >

                        {/* タイトルバーの部分 */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            <h1
                                style={{
                                    flexGrow: 1,
                                    fontSize: 40,
                                    color: contentColor
                                }}
                            >
                                {EnvironmentTool.SITE_NAME}
                            </h1>
                        </div>

                        {/* 記事のタイトルと投稿日時の部分 */}
                        <div
                            style={{
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                padding: 20,
                                backgroundColor: containerColor,
                                borderTopLeftRadius: 40,
                                borderTopRightRadius: 40
                            }}
                        >

                            <h1
                                style={{
                                    fontSize: 70,
                                    color: contentColor,
                                    flexGrow: 1,
                                    wordBreak: 'break-all'
                                }}
                            >
                                {markdownData.title}
                            </h1>

                            <p
                                style={{
                                    fontSize: 40,
                                    color: contentColor,
                                    alignSelf: 'flex-end'
                                }}
                            >
                                {markdownData.createdAt}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: 'KoruriFont',
                    data: fontFileBuffer
                }
            ]
        }
    )
}

/**
 * 動的ルーティング
 * app/posts/[blog]/page.tsx の generateStaticParams と同じなので詳しくはそちらで
 */
export async function generateStaticParams() {
    const fileNameList = await ContentFolderManager.getBlogNameList()
    return fileNameList.map((name) => ({ blog: name }))
}