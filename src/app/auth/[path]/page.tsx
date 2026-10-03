import {AuthView} from "@neondatabase/auth-ui";
import {authViewPaths} from "@neondatabase/auth-ui/server";
export const dynamicParams=false;
export function generateStaticParams(){return Object.values(authViewPaths).map(path=>({path}))}
export default async function AuthPage({params}:{params:Promise<{path:string}>}){const {path}=await params;return <main className="authPage"><div className="authBrand"><a href="/">Curriculos<span>PRO</span></a><p>Crie, salve e mantenha seus currículos disponíveis na sua conta.</p></div><div className="authCard"><AuthView path={path}/></div></main>}
