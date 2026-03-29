# Ethalnethra - E-commerce Platform

A unified e-commerce application featuring a FastAPI backend with MongoDB and an integrated Admin Panel.

## Project Structure

- `ethalnetra_backend/`: FastAPI backend service.
- `ethalnetra_adminpanel/frontend/`: React-based Admin Panel.

---

## 🚀 Backend Setup (ethalnetra_backend)

### Prerequisites
- Python 3.10+
- MongoDB (Running on `localhost:27017` by default)
- Redis (Optional, used for OTP storage with a built-in memory fallback)

### Installation
1. Navigate to the backend directory:
   ```bash
   cd ethalnetra_backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `.env`:
   - `MONGO_CONNECTION_STRING`: Your MongoDB URI.
   - `FAST2SMS_API_KEY`: For SMS OTP (Leave empty to print OTPs in terminal).
   - `REDIS_HOST`/`REDIS_PORT`: For Redis (Memory fallback is active if unavailable).

### Running the Backend
```bash
python -m uvicorn app.main:app --reload
```
The API documentation will be available at `http://localhost:8000/docs`.

### Password Reset Utility
If you forget your test credentials, use the reset script:
```bash
# Sets Admin (admin) to 'admin123' and User (user@example.com) to 'user123'
python reset_pwd.py
```

### Database Seeding
To seed initial categories and products:
```bash
python seed.py
```

---

## 🛠 Admin Panel Setup (ethalnetra_adminpanel)

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd ethalnetra_adminpanel/frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```

### Running the Admin Panel
```bash
npm run dev
```
The panel will typically run on `http://localhost:5173`.

---

## 💡 Troubleshooting & Notes

### Redis Connection Error
If you see `ConnectionError` for Redis, the system will automatically fall back to **in-memory storage** for OTPs. 
To run Redis on Windows manually:
1. Open PowerShell and navigate to your Redis folder:
   ```powershell
   cd "C:\Program Files\Redis"
   .\redis-server.exe
   ```

### SMS Not Sending
If the SMS API fails (or you don't have a key), the backend will automatically:
1. Log the failure in the terminal.
2. **Print the OTP to the console** so you can still complete the login/signup flow.

### Database Initialization
If you get database errors, ensure your MongoDB service is running:
- Open Service Manager (`services.msc`) and start `MongoDB`.
- Or run `mongod` in a separate terminal.
