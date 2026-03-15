

## Step-by-Step Guide

### Step 1: Open Command Prompt
Open the Command Prompt (cmd) on your Windows machine.

### Step 2: Navigate to Desktop
```
cmd
cd %USERPROFILE%\Desktop
```

### Step 3: Clone the GitHub Repository
```
cmd
git clone https://github.com/Jomall/trackit3-5-2026.git trackit-home-352026
```
This will create a folder named "trackit-home-352026" on your Desktop with all the files from the GitHub repository.

### Step 4: Navigate to the Project Folder
```
cmd
cd trackit-home-352026
```

### Step 5: Install Dependencies
```
cmd
npm install
```
This will install all the required packages (Next.js, React, Tailwind CSS, Prisma, etc.).

### Step 6: Kill Any Process Using Port 3000 (if needed)
If port 3000 is already in use, find and kill the process:
```
cmd
netstat -ano | findstr :3000
taskkill /F /PID <PROCESS_ID>
```

### Step 7: Start the Application on Localhost 3000
```
cmd
npm run dev
```
Or alternatively:
```
cmd
npx next dev -p 3000
```

### Step 8: Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

The application should now be running successfully on localhost 3000.
