@echo off
echo Starting TVBOT Local Server...

if "%1"=="--conda" goto conda_setup

echo Checking Python virtual environment...
if not exist venv\ (
    echo Creating virtual environment 'venv'...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing requirements if needed...
python -m pip install -r requirements.txt > nul 2>&1

python server.py
pause
exit /b

:conda_setup
echo Using Conda environment...
call conda env list | find /i "tvbot-local" > nul
if errorlevel 1 (
    echo Creating Conda environment 'tvbot-local'...
    call conda env create -f environment.yml
)
call conda activate tvbot-local
python server.py
pause
exit /b
