# === STAGE 1: Build του React/Vite App ===
FROM node:20-alpine AS builder

WORKDIR /app

# Αντιγραφή των αρχείων εξαρτήσεων για καλύτερο caching
COPY package*.json ./

# Εγκατάσταση όλων των dependencies
RUN npm ci

# Αντιγραφή του υπόλοιπου κώδικα του frontend
COPY . .

# Δημιουργία των static αρχείων παραγωγής (παράγει τον φάκελο /app/dist)
RUN npm run build


# === STAGE 2: Σερβίρισμα των αρχείων με Nginx ===
FROM nginx:alpine

# Αντιγραφή των built αρχείων από το Stage 1 στον φάκελο που διαβάζει ο Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Ενημέρωση του Docker ότι ο container ακούει στη θύρα 80
EXPOSE 80

# Εκκίνηση του Nginx στο προσκήνιο
CMD ["nginx", "-g", "daemon off;"]
