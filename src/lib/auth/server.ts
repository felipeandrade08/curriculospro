import {createNeonAuth} from "@neondatabase/auth/next/server";

const baseUrl=process.env.NEON_AUTH_BASE_URL;
const cookieSecret=process.env.NEON_AUTH_COOKIE_SECRET;

if(process.env.NODE_ENV==="production"&&(!baseUrl||!cookieSecret)){
 throw new Error("Neon Auth production environment is not configured");
}

export const auth=createNeonAuth({
 baseUrl:baseUrl||"http://localhost:3000/api/auth",
 cookies:{secret:cookieSecret||"curriculospro-build-only-cookie-secret-not-for-production",sessionDataTtl:300}
});
