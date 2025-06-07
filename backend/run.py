# run.py
from dotenv import load_dotenv
load_dotenv()    # 這行會自動讀取 .env 到 os.environ

from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
