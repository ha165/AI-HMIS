# AI-HMIS
1. Built with Laravel 11 and react with vite
## Laravel Backend:API Backend Installation

1. Navigate in your Laravel API project folder: `cd your-backend-api`
2. Install project dependencies: `composer install`
3. Create a new .env file: `cp .env.example .env`
4. Add your own database credentials in the .env file in DB_DATABASE, DB_USERNAME, DB_PASSWORD
5. Create users table: `php artisan migrate --seed`
6. Generate application key: `php artisan key:generate`
7. Install Laravel Passport: `php artisan passport:install` and set in the .env file the CLIENT_ID and CLIENT_SECRET that you receive
8. Add your own mailtrap.io credentials in MAIL_USERNAME and MAIL_PASSWORD in the .env file
9. Allow photo storage using `php artisan storage:link`

## React Frontend Installation

1. Set up your api for the project
2. Download and Install NodeJs LTS version from [NodeJs Official Page](https://nodejs.org/en/download/).
3. cd to your react app `cd react-app` of the product and run `yarn install` or `npm install` to install our local dependencies.

## Python Model Installation (FastAPI + TinyApi)
The AI model is used to analyze chest X-ray images and is located in the AI_models folder.
1.Ensure you have Python 3.10+ (64-bit) installed.
2.Create a virtual environment inside your project root:
 `cd Ai_models`
 `python -m venv venv`
3 Activate virtual enviroment
 
  #Windows
 `venv\Scripts\activate`
  
  #Mac/linux
  `source venv\bin\activate`

4.Install python dependancies
  `pip install fastapi uvicorn pillow torch torchvision python-multipart`

5.Start the API server on port 8001
`uvicorn analyzer_api:app --reload --host 0.0.0.0 --port 8001`

6.make sure you have access tokens from Hugging face to access the chat assistance

#.env file
`HF_TOKENS`

Laravel will forward requests to this server via .env variable:
 `XRAY_API_URL=http://127.0.0.1:8001/predict`

The TinyCNN model is saved in the same folder as xray_tiny_cnn.pth.
Make sure it is present before starting FastAPI. If not, the server will train it on first run using the sample dataset.