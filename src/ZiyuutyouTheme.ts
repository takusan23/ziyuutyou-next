import { createTheme } from '@mui/material/styles';
import React from 'react';

/**
 * https://material-foundation.github.io/material-theme-builder/
 *
 * Primary : R 144 G 155 B 222
 *
 * Secondary : R 238 G 221 B 225
 * 
 * Tertiary : R 210 G 248 B 226
 * 
 * Android 向けに export して使っています
 */

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
                    main: isDarkmode ? '#BBC3FF' : '#4A58A9', // md_theme_light_primary
                },
                secondary: {
                    main: '#974068', // md_theme_light_secondary
                },
                error: {
                    main: '#BA1A1A', // md_theme_light_error
                },
                background: {
                    default: isDarkmode ? '#000000' : '#DEE0FF', // md_theme_light_primaryContainer
                    paper: isDarkmode ? '#1B1B1F' : '#FFFBFF', // md_theme_light_surface : md_theme_dark_surface
                    // createPallete.d.ts を書いて追加した
                    secondary: isDarkmode ? '#1F1E26' : '#E5E1E5', // md_theme_light_surface : md_theme_dark_surface に 0.9 をかけたもの。カラーコード 明るさ とかで検索してください
                }
            },
            typography: {
                fontFamily: [
                    'Koruri Regular'
                ].join(','),
            }
        }), [isDarkmode])
}

export default useCustomTheme