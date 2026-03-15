@echo off
echo Deleting Prisma cache...
rmdir /s /q node_modules\.prisma
rmdir /s /q node_modules\@prisma
npm install
npx prisma generate
echo Done! Run npm run dev
pause
