#!/bin/bash
echo "Starting TVBOT Local Server..."

# Check if conda is available and user wants to use it (optional argument --conda)
if [ "$1" == "--conda" ]; then
    echo "Using Conda environment..."
    if ! command -v conda &> /dev/null; then
        echo "Conda is not installed or not in PATH."
        exit 1
    fi
    # Check if environment exists
    if ! conda env list | grep -q "tvbot-local"; then
        echo "Creating Conda environment 'tvbot-local'..."
        conda env create -f environment.yml
    fi
    source "$(conda info --base)/etc/profile.d/conda.sh"
    conda activate tvbot-local
    python server.py
    exit 0
fi

# Default to standard Python/pip with virtualenv
echo "Checking Python virtual environment..."
if [ ! -d "venv" ]; then
    echo "Creating virtual environment 'venv'..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing requirements if needed..."
pip install -r requirements.txt > /dev/null 2>&1

python server.py

