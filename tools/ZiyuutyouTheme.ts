import { createTheme } from '@mui/material/styles';
import React from 'react';
/**
 * 見た目というかテーマのデータを作る
 * 
 * JetpackComposeだと MaterialTheme{ } かな？
 * 
 * @param isDarkmode ダークモードならtrue
 */
const useCustomTheme = (isDarkmode: boolean) => {
    // isDarkmode が変わったときだけ再計算されるはず
    return React.useMemo(
        () => createTheme({
            palette: {
                mode: isDarkmode ? 'dark' : 'light',
                primary: {
                    main: isDarkmode ? '#b6c4ff' : '#4559a9', // md_theme_light_primary
                },
                secondary: {
                    main: '#006c49',
                },
                error: {
                    main: '#ba1b1b',
                },
                background: {
                    default: isDarkmode ? '#000000' : '#dce1ff', // md_theme_light_primaryContainer
                    paper: isDarkmode ? '#1b1b1f' : '#fefbff', // md_theme_light_surface : md_theme_dark_surface
                }
            },
            typography: {
                fontFamily: [
                    'Koruri Regular'
                ].join(','),
            }
        }),
        [isDarkmode]
    )
}

export default useCustomTheme