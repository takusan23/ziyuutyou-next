import { Box, useTheme } from "@mui/material"
import Link from "next/link"
import TocData from "../src/data/TocData"

/** TocList へ渡すデータ */
type TocListProps = {
    /** 目次の配列 */
    tocDataList: Array<TocData>,
}

/** TocListLayout へ渡すデータ */
type TocListLayoutProps = {
    /** セカンダリーコンポーネントの幅 */
    secondaryWidth: number,
    /** マスター コンポーネント */
    master: React.ReactNode,
    /** セカンダリー コンポーネント。これが目次になる */
    secondary: React.ReactNode
}

/** 目次を表示する */
export const TocList: React.FC<TocListProps> = (props) => {
    const theme = useTheme()
    return (
        <ul
            style={{
                borderLeft: 'solid',
                borderLeftWidth: 1,
                borderLeftColor: theme.palette.primary.main,
                listStyleType: 'none',
                paddingLeft: 0
            }}
        >
            {
                props.tocDataList.map((tocData, index) => (
                    <li key={index}
                        style={{
                            // 階層を padding でわかりやすく...
                            paddingLeft: tocData.level * 10,
                            paddingBottom: 5,
                            paddingTop: 5
                        }}>
                        <Link
                            style={{
                                textDecoration: 'none',
                                color: theme.palette.primary.main,
                            }}
                            href={`${tocData.hashTag}`}
                        >
                            {tocData.label}
                        </Link>
                    </li>
                ))
            }
        </ul>
    )
}

/**
 * 画面の幅が広いときだけ横に目次を出すレイアウト。
 * 目次なのでセカンダリーコンポーネントはスクロール時に追従するCSSをセットしてあります。
 */
export const TocListLayout: React.FC<TocListLayoutProps> = (props) => {
    return (
        <Box
            sx={{
                // MUI の Breakpoint とか言う機能で画面の大きさ次第でプロパティの値を変更する
                display: {
                    xs: 'display',
                    lg: 'flex'
                }
            }}
        >
            <Box
                sx={{
                    width: {
                        xs: '100%',
                        lg: `calc(100% - ${props.secondaryWidth}px)`
                    }
                }}
            >
                {props.master}
            </Box>

            <Box
                sx={{
                    display: {
                        xs: 'none',
                        lg: 'block'
                    },
                    width: props.secondaryWidth,
                    paddingLeft: 2,
                    position: 'sticky',
                    alignSelf: 'flex-start',
                    top: 0,
                }}
            >
                {props.secondary}
            </Box>
        </Box>
    )
}