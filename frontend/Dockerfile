# Base Stage
FROM node:22-alpine as base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Dev Stage
FROM base as dev
CMD ["npm", "run", "dev", "--", "--host"]

# Build Stage
FROM base as build
RUN npm run build

# Serve Stage
FROM nginx:alpine as production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# SSL Certs
COPY cert.pem /etc/nginx/ssl/cert.pem
COPY key.pem /etc/nginx/ssl/key.pem

# Expose port 80 and 443
EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
