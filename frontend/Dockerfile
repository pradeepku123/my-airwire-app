# Build Stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Serve Stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# SSL Certs
COPY cert.pem /etc/nginx/ssl/cert.pem
COPY key.pem /etc/nginx/ssl/key.pem

# Expose port 80 and 443
EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
