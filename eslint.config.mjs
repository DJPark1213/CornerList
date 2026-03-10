import { default as nextConfig } from "eslint-config-next/core-web-vitals";
import { default as nextTypescript } from "eslint-config-next/typescript";

const eslintConfig = [...nextConfig, ...nextTypescript];

export default eslintConfig;
