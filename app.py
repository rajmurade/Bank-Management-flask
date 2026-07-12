from flask import Flask, render_template, request, jsonify
from bank import Bank

app = Flask(__name__)
bank_system = Bank()

@app.route('/')
def index():
    """Serves the main banking control panel template."""
    return render_template('index.html')

@app.route('/create-account', methods=['POST'])
def create_account():
    data = request.get_json() or {}
    name = data.get('name')
    age = data.get('age')
    email = data.get('email')
    pin = data.get('pin')

    success, result = bank_system.create_account(name, age, email, pin)
    
    if success:
        return jsonify({
            "success": True,
            "message": f"Account registration successful! Account Number: {result['account_number']}",
            "account_number": result['account_number']
        }), 201
    else:
        return jsonify({
            "success": False,
            "message": result
        }), 400

@app.route('/deposit', methods=['POST'])
def deposit():
    data = request.get_json() or {}
    account_number = data.get('account_number')
    pin = data.get('pin')
    amount = data.get('amount')

    success, message = bank_system.deposit(account_number, pin, amount)
    
    if success:
        return jsonify({"success": True, "message": message}), 200
    else:
        return jsonify({"success": False, "message": message}), 400

@app.route('/withdraw', methods=['POST'])
def withdraw():
    data = request.get_json() or {}
    account_number = data.get('account_number')
    pin = data.get('pin')
    amount = data.get('amount')

    success, message = bank_system.withdraw(account_number, pin, amount)
    
    if success:
        return jsonify({"success": True, "message": message}), 200
    else:
        return jsonify({"success": False, "message": message}), 400

@app.route('/details', methods=['POST'])
def details():
    data = request.get_json() or {}
    account_number = data.get('account_number')
    pin = data.get('pin')

    success, result = bank_system.get_details(account_number, pin)
    
    if success:
        return jsonify({
            "success": True,
            "message": "Security clearance verification complete.",
            "data": result
        }), 200
    else:
        return jsonify({"success": False, "message": result}), 400

@app.route('/update', methods=['PUT'])
def update():
    data = request.get_json() or {}
    account_number = data.get('account_number')
    pin = data.get('pin')
    field = data.get('field')
    value = data.get('value')

    success, message = bank_system.update_details(account_number, pin, field, value)
    
    if success:
        return jsonify({"success": True, "message": message}), 200
    else:
        return jsonify({"success": False, "message": message}), 400

@app.route('/delete', methods=['DELETE'])
def delete_account():
    data = request.get_json() or {}
    account_number = data.get('account_number')
    pin = data.get('pin')

    success, message = bank_system.delete_account(account_number, pin)
    
    if success:
        return jsonify({"success": True, "message": message}), 200
    else:
        return jsonify({"success": False, "message": message}), 400

if __name__ == '__main__':
    # Starts local server in debug mode for development
    app.run(debug=True, port=5000)