from http.server import BaseHTTPRequestHandler
import json, numpy as np
from sklearn.metrics.pairwise import cosine_similarity

history = np.array([
    [1, 1, 1, 0, 0], # User 1: Milk, Bread, Eggs
    [0, 1, 1, 1, 0], # User 2: Bread, Eggs, Apples
    [1, 0, 0, 1, 1]  # User 3: Milk, Apples, Bananas
])
items = ["Milk", "Bread", "Eggs", "Apples", "Bananas"]

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        req = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        current_cart = np.array([req.get('cart', [0,0,0,0,0])])
        
        similarities = cosine_similarity(current_cart, history)
        best_match = np.argmax(similarities)
        
        recommendations = [items[i] for i, val in enumerate(history[best_match]) 
                           if val == 1 and current_cart[0][i] == 0]
                
        self.send_response(200)
        self.end_headers()
        self.wfile.write(json.dumps({"suggested": recommendations}).encode('utf-8'))