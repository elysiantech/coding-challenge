from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import random
import dotenv
import asyncio
from typing import Dict, Optional, Literal
from langchain.chat_models.openai import ChatOpenAI
from langchain.chat_models.anthropic import ChatAnthropic 

dotenv.load_dotenv()

app = Flask(__name__)
CORS(app)

# TODO: Implement version tracking
VERSION = "1.0.0"


def process_transcription(job_id: str, audio_data: bytes):
    """Mock function to simulate async transcription processing. Returns a random transcription."""
    time.sleep(random.randint(5, 20))
    return random.choice([
        "I've always been fascinated by cars, especially classic muscle cars from the 60s and 70s. The raw power and beautiful design of those vehicles is just incredible.",
        "Bald eagles are such majestic creatures. I love watching them soar through the sky and dive down to catch fish. Their white heads against the blue sky is a sight I'll never forget.",
        "Deep sea diving opens up a whole new world of exploration. The mysterious creatures and stunning coral reefs you encounter at those depths are unlike anything else on Earth."
    ])

def categorize_transcription(job_id: str, text: str, aiProvider: str):
    # Validate AI Provider
    if aiProvider not in ['openai', 'anthropic']:
        return {"error": f"Unsupported AI provider: {aiProvider}"}

    try:
        # Instantiate the appropriate AI model
        if aiProvider == 'anthropic':
            model = ChatAnthropic(model_name="claude-2", temperature=0.5)  # Configure as needed
        else :
            model = ChatOpenAI(model_name="gpt-4", temperature=0.5)  # Configure as needed
        
        # System prompt for categorization
        system_prompt = """
        You are an AI assistant that categorizes transcription text into predefined categories. 
        The categories are: 
        - Meeting Notes
        - Personal Conversation
        - Technical Discussion
        - Customer Support Interaction
        - Other

        Analyze the given transcription text and return the most appropriate category. 
        return only category and nothing elsee.
        """

        # Create the prompt for the model
        categorization_prompt = f"{system_prompt}\n\nTranscription Text: {text}\n\nCategory and Explanation:"

        # Use the model to predict the category
        categorization_result = model.predict(categorization_prompt)

        # Return the categorization result
        return {"job_id": job_id, "category": categorization_result}

    except Exception as e:
        return {"error": f"Failed to categorize transcription: {str(e)}"}

def categorize_transcription(transcription_string: str, user_id: str):
    # TODO: Implement transcription categorization
    model_to_use = get_user_model_from_db(user_id)
    if model_to_use == "openai":
        # TODO: Implement OpenAI categorization
        pass
    elif model_to_use == "anthropic":
        # TODO: Implement Anthropic categorization
        pass


def get_user_model_from_db(user_id: str) -> Literal["openai", "anthropic"]:
    """
    Mocks a slow and expensive function to simulate fetching a user's preferred LLM model from database
    Returns either 'openai' or 'anthropic' after a random delay.
    """
    time.sleep(random.randint(2, 8))
    return random.choice(["openai", "anthropic"])


@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    result = process_transcription("xyz", "abcde")

    # TODO: Implement categorization
    # result = categorize_transcription(result, "user_id")

    return jsonify({
        "transcription": result,
        # TODO: Add category
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
