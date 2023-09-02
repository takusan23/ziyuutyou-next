
/**
 * Tailwind CSS のテーマ設定をする。色とか
 * 
 * Primary / Secondary はそれぞれ 文字の色 と 背景色 があります。
 * 
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
 * カラーコード明るさ調整
 * https://color-code-brightness.negitoro.dev/
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // 既存の色を拡張する（プライマリカラー等を追加する）
    extend: {
      // ネストできるので、テーマ別にそれぞれ
      colors: {
        // コンテンツで使う色
        content: {
          // プライマリーカラー
          primary: {
            // md_theme_light_primary
            light: '#4A58A9',
            dark: '#BBC3FF'
          },
          // セカンダリーカラー
          secondary: {
            // md_theme_light_secondary
            light: '#974068',
            dark: '#974068'
          },
          // 文字
          text: {
            // md_theme_dark_background : md_theme_light_background
            light: '#1B1B1F',
            dark: '#FEFBFF'
          }
        },

        // コンテナの色。コンテンツの色の下に敷く
        container: {
          // プライマリーカラー
          primary: {
            // md_theme_light_surface : md_theme_dark_surface
            light: '#FFFBFF',
            dark: '#1B1B1F'
          },
          // セカンダリーカラー
          secondary: {
            // md_theme_light_surface : md_theme_dark_surface の RGB それぞれに 0.95 倍したもの。カラーコード 明るさ とかで検索
            light: '#f2eef2',
            dark: '#19191d'
          }
        },

        // Error ?
        error: {
          // md_theme_light_error
          light: '#BA1A1A',
          dark: '#BA1A1A'
        },

        // 背景色
        background: {
          // md_theme_light_primaryContainer
          light: '#DEE0FF',
          dark: '#000000'
        },

        // 選択時の色（ホバー）
        hover: {
          // md_theme_light_primary の 25% の色。16進数なので 40 です（RGBA）
          light: '#4A58A940',
          dark: '#BBC3FF40'
        },
      },
      fontFamily: {
        // next/font で読み込んだやつ
        'body': ['var(--koruri-font)'],
      }
    },
  },
  plugins: [],
}

