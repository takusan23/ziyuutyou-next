import { unstable_cache } from "next/cache"

/**
 * 計算結果をキャッシュするためのクラス。
 * {@link ContentFolderManager}のマークダウンパース結果を使い回すために作ったけど、それ以外でも使えるはず。
 * 
 * キャッシュは Next.js の cache() を使って実装されています。
 * https://nextjs.org/docs/app/api-reference/functions/unstable_cache
 */
export class NextJsCacheStore<T> implements CacheStore<T> {

    async getCache(key: string, notExists: (key: string) => Promise<T>): Promise<T> {
        // キャッシュがあればそれ、なければ notExists を呼び出す
        const cacheOrCreate = unstable_cache(
            async () => notExists(key),
            [key],
            { tags: [key] }
        )
        // 待って返す
        const result = await cacheOrCreate()
        return result
    }

    deleteCache(key: string): void {
        // 未実装
        // ブラウザのスーパーリロードをすれば消せます。
    }

}

/**
 * 計算結果をキャッシュするためのクラスのインターフェース。
 * 
 * 詳しくは実装の {@link NextJsCacheStore} へ。
 * 一応 Next.js に強く依存せず、いつでも外せるようにこんな感じになっている。（シングルトンでも書けるように）
 */
export interface CacheStore<T> {

    /**
     * キャッシュを取得する。
     * 
     * @param key キー
     * @param notExists キャッシュが存在しない場合は呼び出される。ここの返り値が返され、キャッシュされます。async 使えます。
     * @return T
     */
    getCache(key: string, notExists: (key: string) => Promise<T>): Promise<T>

    /**
     * キャッシュを破棄する
     * 
     * @param key キー
     */
    deleteCache(key: string): void
}