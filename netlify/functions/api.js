python
from flask import Flask, request, jsonify
from flask_cors import CORS
import resend

app = Flask(__name__)
CORS(app)

# Replace with your Resend API key
resend.api_key = "YOUR_RESEND_API_KEY"

@app.route("/")
def home():
    return "Backend running"

@app.route("/send-email", methods=["POST"])
def send_email():
    data = request.get_json()

    email = data.get("email")

    if not email:
        return jsonify({"error": "Email required"}), 400

    resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": [email],
        "subject": "Test Email",
        "html": """
        <h2>Email Test</h2>
        <p>Your email was received successfully.</p>
        """
    })

    return jsonify({
        "success": True,
        "message": f"Email sent to {email}"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4150)
