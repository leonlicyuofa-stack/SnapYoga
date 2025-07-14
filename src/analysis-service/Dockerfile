
# Use an official lightweight Python image.
# https://hub.docker.com/_/python
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code into the container
COPY . .

# Command to run the application
# Cloud Run will automatically use the PORT environment variable
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app
