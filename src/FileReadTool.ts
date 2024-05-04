import fs from "fs/promises"
import path from "path"

/**
 * ファイルを読み出す
 * ぶっちゃけこれだけなら関数にする必要もない。。。
 */
class FileReadTool {

    /** <img> の src へ base64 のデータを渡す際に先頭に入れておく文字列。png 版。 */
    static BASE64_PREFIX_PNG = 'data:image/png;base64,'

    /** {@link BASE64_PREFIX_PNG}の svg 版。 */
    static BASE64_PREFIX_SVG = 'data:image/svg+xml;,'

    /**
     * 引数に渡したファイルパスのデータを base64 形式で読み出して返す
     * 
     * @param filePathSegments ファイルパス。/app/icon.png なら可変長引数に 'app', 'icon.png' を渡す。
     * @returns base64 のデータ
     */
    static async readBase64(...filePathSegments: string[]) {
        return await fs.readFile(path.join(process.cwd(), ...filePathSegments), { encoding: 'base64' })
    }

    /**
     * テキストファイルを読み出す。
     * 
     * @param filePathSegments ファイルパス。/public/icon/menu.svg なら可変長引数に 'public', 'icon', 'menu.svg' を渡す。
     */
    static async readTextFile(...filePathSegments: string[]) {
        return await fs.readFile(path.join(process.cwd(), ...filePathSegments), { encoding: 'utf-8' })
    }

    /**
     * 引数に渡したファイルパスを読み出して Buffer で返す
     * 
     * @param filePathSegments ファイルパス。/styles/css/fonts/font.ttf なら可変長引数に 'styles', 'css', 'fonts', 'font.ttf' を渡す。
     */
    static async readByteArray(...filePathSegments: string[]) {
        return await fs.readFile(path.join(process.cwd(), ...filePathSegments))
    }
}

export default FileReadTool