import os
import json
import random

class Bank:
    def __init__(self, db_file="data.json"):
        self.db_file = db_file
        self.accounts = self._load_data()

    def _load_data(self):
        """Reads banking data from the JSON file or initializes empty storage."""
        if not os.path.exists(self.db_file):
            return {}
        try:
            with open(self.db_file, 'r') as file:
                return json.load(file)
        except json.JSONDecodeError:
            return {}

    def _save_data(self):
        """Persists memory data structures back to data.json."""
        with open(self.db_file, 'w') as file:
            json.dump(self.accounts, file, indent=4)

    def _generate_account_number(self):
        """Generates a unique 6-digit account number sequence."""
        while True:
            acc_num = str(random.randint(100000, 999999))
            if acc_num not in self.accounts:
                return acc_num

    def create_account(self, name, age, email, pin):
        """Registers a new core account record."""
        if not name or not email or not pin:
            return False, "Invalid account inputs. Ensure all fields are filled."
        
        if len(str(pin)) != 4 or not str(pin).isdigit():
            return False, "PIN must be exactly 4 digits."

        try:
            age_val = int(age)
            if age_val < 18:
                return False, "Applicant must be 18 or older."
        except ValueError:
            return False, "Age must be a numeric value."

        account_number = self._generate_account_number()
        
        self.accounts[account_number] = {
            "name": name,
            "age": age_val,
            "email": email,
            "pin": str(pin),
            "balance": 0.0
        }
        self._save_data()
        return True, {"account_number": account_number, "message": "Account created successfully."}

    def deposit(self, account_number, pin, amount):
        """Deposits funds into a validated account."""
        acc = self.accounts.get(str(account_number))
        if not acc:
            return False, "Account record not found."
        
        if acc["pin"] != str(pin):
            return False, "Invalid PIN code."

        try:
            dep_amount = float(amount)
            if dep_amount <= 0:
                return False, "Deposit amount must be greater than zero."
        except ValueError:
            return False, "Amount must be a decimal/numeric format."

        acc["balance"] += dep_amount
        self._save_data()
        return True, f"Successfully deposited ${dep_amount:.2f}. New Balance: ${acc['balance']:.2f}"

    def withdraw(self, account_number, pin, amount):
        """Withdraws funds from a validated account."""
        acc = self.accounts.get(str(account_number))
        if not acc:
            return False, "Account record not found."
        
        if acc["pin"] != str(pin):
            return False, "Invalid PIN code."

        try:
            with_amount = float(amount)
            if with_amount <= 0:
                return False, "Withdrawal amount must be greater than zero."
        except ValueError:
            return False, "Amount must be a decimal/numeric format."

        if acc["balance"] < with_amount:
            return False, "Insufficient funds."

        acc["balance"] -= with_amount
        self._save_data()
        return True, f"Successfully withdrew ${with_amount:.2f}. New Balance: ${acc['balance']:.2f}"

    def get_details(self, account_number, pin):
        """Fetches account profiles upon security clearance."""
        acc = self.accounts.get(str(account_number))
        if not acc:
            return False, "Account record not found."
        
        if acc["pin"] != str(pin):
            return False, "Invalid PIN code."

        return True, {
            "account_number": account_number,
            "name": acc["name"],
            "age": acc["age"],
            "email": acc["email"],
            "balance": acc["balance"]
        }

    def update_details(self, account_number, pin, field, value):
        """Updates account attributes dynamically."""
        acc = self.accounts.get(str(account_number))
        if not acc:
            return False, "Account record not found."
        
        if acc["pin"] != str(pin):
            return False, "Invalid PIN code."

        if field not in ["name", "age", "email"]:
            return False, "Invalid modification field targeted."

        if field == "age":
            try:
                val = int(value)
                if val < 18:
                    return False, "Age must be at least 18."
                acc["age"] = val
            except ValueError:
                return False, "Age field must be an integer."
        else:
            if not str(value).strip():
                return False, "Update values cannot be empty."
            acc[field] = str(value).strip()

        self._save_data()
        return True, f"Successfully updated account profile {field}."

    def delete_account(self, account_number, pin):
        """Deletes an account record completely."""
        acc = self.accounts.get(str(account_number))
        if not acc:
            return False, "Account record not found."
        
        if acc["pin"] != str(pin):
            return False, "Invalid PIN code."

        del self.accounts[str(account_number)]
        self._save_data()
        return True, "Account deleted successfully."