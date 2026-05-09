from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS
from routes.profile  import profile_bp
from routes.deep     import deep_bp
from routes.compare  import compare_bp
from routes.academic import academic_bp
from routes.predict  import predict_bp
from routes.ai_analysis import ai_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(profile_bp)
app.register_blueprint(deep_bp)
app.register_blueprint(compare_bp)
app.register_blueprint(academic_bp)
app.register_blueprint(predict_bp)
app.register_blueprint(ai_bp)

@app.route("/api/health")
def health():
    return {"status": "online", "version": "3.0.0"}

if __name__ == "__main__":
    app.run(debug=True, port=8000)