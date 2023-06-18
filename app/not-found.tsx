import { Metadata } from "next";
import ClientNotFoundPage from "./ClientNotFoundPage";

/** <head> に入れる値 */
export const metadata: Metadata = {
    title: '404 - たくさんの自由帳'
}

/** 404ページ */
export default function NotFound() {
    return <ClientNotFoundPage />
}