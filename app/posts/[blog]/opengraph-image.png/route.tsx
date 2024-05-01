import { ImageResponse } from "next/og"
import ContentFolderManager from "../../../../src/ContentFolderManager"
import resolveConfig from "tailwindcss/resolveConfig"
import tailwindConfig from "../../../../tailwind.config.js"
import EnvironmentTool from "../../../../src/EnvironmentTool"
import FileReadTool from "../../../../src/FileReadTool"

/** 動的ルーティング */
type PageProps = {
    params: { blog: string }
}

/**
 * OG 画像を生成するルートハンドラー
 * OG 画像を静的書き出し時に生成するため、request 引数は使ってはいけない。
 */
export async function GET(_: Request, { params }: PageProps) {
    // 記事を取得
    const markdownData = await ContentFolderManager.getBlogItem(params.blog)

    // Tailwind CSS の色を取得
    const colors = resolveConfig(tailwindConfig).theme?.colors
    const backgroundColor = colors['background']['light']
    const containerColor = colors['container']['primary']['light']
    const contentColor = colors['content']['primary']['light']

    // 表示するアイコン。相対 URL 無理っぽいんで、相対パスで読み込んで base64 で渡す
    // アバター画像。/app/icon.png
    const iconBase64 = await FileReadTool.readBase64('app', 'icon.png')
    // ナビゲーションドロワーのアイコン
    const homeIconBase64 = await FileReadTool.readTextFile('public', 'icon', 'home.svg')
    const blogIconBase64 = await FileReadTool.readTextFile('public', 'icon', 'book.svg')
    const tagIconBase64 = await FileReadTool.readTextFile('public', 'icon', 'sell.svg')


    return new ImageResponse(
        (
            // 背景
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    position: 'relative',
                    display: 'flex',
                    backgroundColor: backgroundColor
                }}
            >

                {/* flex 横並び。パーセントで仕切るんじゃなくて、flex-grow 使うべきな気がするけど、width 明示的に指定しないとテキストの折り返し出来ない気がして、、 */}
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
                            width={60}
                            height={60}
                            src={`${FileReadTool.BASE64_PREFIX_PNG}${iconBase64}`}
                        />

                        {/* ナビゲーションドロワーのアイコン並んでる部分 */}
                        {
                            [homeIconBase64, blogIconBase64, tagIconBase64].map((svg) => (
                                <img
                                    style={{ marginTop: 30 }}
                                    width={40}
                                    height={40}
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
                                alignItems: 'center',
                                minWidth: '0'
                            }}
                        >
                            <h1
                                style={{
                                    fontSize: 40,
                                    color: contentColor,
                                    flexGrow: 1
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
                                marginTop: 20,
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
                                    color: contentColor
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
            height: 630
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