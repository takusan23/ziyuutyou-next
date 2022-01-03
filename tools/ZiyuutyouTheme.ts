import { createTheme } from '@mui/material/styles';

/**
 * 見た目というかテーマのデータを作る
 * 
 * JetpackComposeだと MaterialTheme{ } かな？
 */
const theme = createTheme({
    palette: {
        primary: {
            main: '#4559a9',
        },
        secondary: {
            main: '#006c49',
        },
        error: {
            main: '#ba1b1b',
        },
        background: {
            default: '#dce1ff',
            paper: '#ffffff'
        },
    }
})

export default theme