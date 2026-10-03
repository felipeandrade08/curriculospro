import "@neondatabase/auth-ui/css";
import type { Metadata } from "next";
import "./globals.css";
import {Providers} from "./providers";
export const metadata: Metadata={title:"CurriculosPRO — Seu currículo profissional",description:"Crie um currículo moderno, profissional e pronto para oportunidades em poucos minutos.",icons:{icon:"/brand/icon.png",shortcut:"/brand/icon.png",apple:"/brand/icon.png"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body><Providers>{children}</Providers></body></html>}