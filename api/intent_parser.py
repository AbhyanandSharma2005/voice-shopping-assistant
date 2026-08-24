from http.server import BaseHTTPRequestHandler
import json
import spacy
import re

# Load the lightweight English model specified in requirements.txt
nlp = spacy.load("en_core_web_sm")

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # 1. Read request body
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        data = json.loads(body)
        raw_text = data.get('text', '').lower()

        # 2. Process text with spaCy
        doc = nlp(raw_text)
        
        intent = "UNKNOWN"
        item = ""
        qty = 1
        max_price = None
        query = ""

        # 3. Intent classification via Lemmatization
        lemmas = [token.lemma_ for token in doc]
        
        if any(word in lemmas for word in ["find", "search", "look"]):
            intent = "SEARCH_ITEM"
            # Extract price if "under X" exists
            price_match = re.search(r'under\s*\$?(\d+)', raw_text)
            if price_match:
                max_price = int(price_match.group(1))
            # Extract nouns as search query
            query = " ".join([token.text for token in doc if token.pos_ == "NOUN"])
            
        elif any(word in lemmas for word in ["clear", "empty"]) and "list" in lemmas:
            intent = "CLEAR_LIST"
            
        elif any(word in lemmas for word in ["show", "read", "what"]) and "list" in lemmas:
            intent = "LIST_ITEMS"
            
        elif any(word in lemmas for word in ["remove", "delete", "rid"]):
            intent = "REMOVE_ITEM"
            item = " ".join([token.text for token in doc if token.pos_ in ["NOUN", "PROPN"]])
            
        elif any(word in lemmas for word in ["add", "need", "buy", "want"]):
            intent = "ADD_ITEM"
            # Extract quantity
            for token in doc:
                if token.pos_ == "NUM" or token.like_num:
                    try:
                        qty = int(token.text)
                    except ValueError:
                        pass # Handle word numbers in JS fallback if complex
            
            # Extract the actual product name (Nouns/Proper Nouns) ignoring verbs/fillers
            item_tokens = [token.text for token in doc if token.pos_ in ["NOUN", "PROPN", "ADJ"] and token.lemma_ not in ["list", "bottle", "box"]]
            item = " ".join(item_tokens)

        # 4. Construct the response matching the React frontend's expectations
        response_data = {
            "intent": intent,
            "item": item if item else None,
            "quantity": qty,
            "query": query if query else None,
            "maxPrice": max_price
        }

        # 5. Send HTTP Response
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode('utf-8'))