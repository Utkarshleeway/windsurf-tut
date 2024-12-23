from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

# Game logic
def determine_winner(player_choice, computer_choice):
    if player_choice == computer_choice:
        return 'tie'
    
    winning_moves = {
        'rock': 'scissors',
        'paper': 'rock',
        'scissors': 'paper'
    }
    
    return 'win' if winning_moves[player_choice] == computer_choice else 'lose'

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/play', methods=['POST'])
def play():
    try:
        data = request.get_json()
        player_choice = data.get('choice')
        player_name = data.get('playerName')

        if not player_choice or not player_name:
            return jsonify({'error': 'Missing player choice or name'}), 400

        choices = ['rock', 'paper', 'scissors']
        if player_choice not in choices:
            return jsonify({'error': 'Invalid choice'}), 400

        computer_choice = random.choice(choices)
        result = determine_winner(player_choice, computer_choice)

        return jsonify({
            'computerChoice': computer_choice,
            'result': result,
            'message': f"{player_name} chose {player_choice}, Computer chose {computer_choice}"
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
