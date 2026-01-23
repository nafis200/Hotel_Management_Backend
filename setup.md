npm init -y

npm i express

npm install --save @types/express

npm i typescript

tsc --init

npm i cors cookie-parser http-status

npm i --save-dev @types/cors

npm i --save-dev @types/cookie-parser

npm i ts-node-dev

<!-- setup prisma -->


npm install prisma @types/node @types/pg --save-dev 
npm install @prisma/client @prisma/adapter-pg pg dotenv

npx prisma init

prisma.config.ts update code

tsconfig.ts

"rootDir": "./src" 

"exclude": ["node_modules", "dist", "prisma.config.ts"] 
2nd bracket