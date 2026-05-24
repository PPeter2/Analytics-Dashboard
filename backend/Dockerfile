# Χρήση της σταθερής και ελαφριάς έκδοσης Node.js
FROM node:20-alpine

# Ορισμός του περιβάλλοντος σε production
ENV NODE_ENV production

# Ορισμός του φακέλου εργασίας μέσα στον container
WORKDIR /usr/src/app

# Αντιγραφή των αρχείων package.json και package-lock.json για caching
COPY package*.json ./

# Εγκατάσταση ΜΟΝΟ των production dependencies (παραλείπει τα devDependencies)
RUN npm ci --only=production

# Αντιγραφή του υπόλοιπου κώδικα του backend
COPY . .

# Αλλαγή χρήστη σε 'node' για λόγους ασφαλείας (non-root user)
USER node

# Ενημέρωση του Docker ότι το API μας ακούει στη θύρα 5000
EXPOSE 5000

# Εκκίνηση του backend server
CMD ["node", "index.js"]
