FROM node:20-alpine
WORKDIR /app
# کپی فایل‌های lock و workspace از ریشه پروژه
COPY ../../pnpm-lock.yaml ./
COPY ../../pnpm-workspace.yaml ./
COPY . .
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm build
EXPOSE 4000
CMD ["pnpm", "start"]