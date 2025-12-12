type MASK_URL = 'mask-[url'

/** Icon に渡すデータ */
type IconProps = {
    /** 
     * Tailwind CSS のユーティリティ名でアイコンを指定する
     * mask-[url('/icon/svg.svg')] で設定できる
     * 
     * なんで文字列テンプレートが変な位置にあるかというと、バカ正直に書くと TailwindCSS のユーティリティ名走査に引っかかって無駄な CSS を生成しようとする。見つからないようにわざとしている
     * string を受け取ると mask- を忘れるかもしれないため、文字列リテラルを制限したいが、TailwindCSS にはバレないようにしたい
     */
    iconStyle: `${MASK_URL}('${string}')]`
    /** 色をオーバーライドするなら */
    className?: string
    /** サイズ。className で指定する場合は省略可 */
    size?: 'small' | 'medium' | 'large'
    /** 色。テーマの色か、Button.tsx で使う時は親の color: を尊重する */
    color: 'theme' | 'currentColor'
    /** 説明 */
    ariaLabel?: string
}

/** アイコンを表示する。SVG を css の mask-image で表示する。SVG をバンドルしなくても良くなる。 */
export default function Icon({ iconStyle, className, size, color, ariaLabel }: IconProps) {
    let sizeClassName: string
    switch (size) {
        case 'small':
            sizeClassName = 'w-5 h-5'
            break;
        case 'medium':
            sizeClassName = 'w-7 h-7'
            break;
        case 'large':
            sizeClassName = 'w-10 h-10'
            break;
        default:
            sizeClassName = ''
            break
    }

    let colorClassName: string
    switch (color) {
        case "theme":
            colorClassName = 'bg-content-primary-light dark:bg-content-primary-dark'
            break
        case "currentColor":
            colorClassName = 'bg-current'
            break
        default:
            colorClassName = ''
            break
    }

    // mask で SVG を表示することで、JavaScript/HTML へバンドルされずに済む。ロード時間がほんの少し短くなるはず
    return (
        <div
            className={`${iconStyle} ${sizeClassName} ${colorClassName} ${className} mask-no-repeat mask-center mask-contain`}
            role="img"
            aria-label={ariaLabel} />
    )
}
