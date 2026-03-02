# CryptoToken

Simple crypto token list with real time update, powered by the CoinGecko API.

## Quick start

1. **Get a CoinGecko API key**  
   Sign up at [CoinGecko](https://www.coingecko.com/en/api) and create an API key.

2. **Configure the backend**  
   In `backend/`, create a `.env` file (or copy `.env.example` to `.env`) and set:

   ```
   COINGECKO_API_KEY=your_key_here
   ```

3. **Start the backend** (API runs on port 3006)

   ```bash
   cd backend
   npm install
   node index.js
   ```

4. **Start the frontend** (in a new terminal)

   ```bash
   cd frontend
   npm install
   npm start
   ```

   Open [http://localhost:4200](http://localhost:4200) in your browser.

That’s it. The app will load the token list with real time update and you can open any token for details.
