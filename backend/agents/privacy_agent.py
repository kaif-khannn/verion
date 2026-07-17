from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
from presidio_analyzer.nlp_engine import NlpEngineProvider
from presidio_anonymizer import AnonymizerEngine

class PrivacyAgent:
    def __init__(self):
        # Configure Presidio to use the smaller spacy model
        configuration = {
            "nlp_engine_name": "spacy",
            "models": [{"lang_code": "en", "model_name": "en_core_web_sm"}],
        }
        provider = NlpEngineProvider(nlp_configuration=configuration)
        nlp_engine = provider.create_engine()
        
        self.analyzer = AnalyzerEngine(nlp_engine=nlp_engine, supported_languages=["en"])
        
        # Add a custom regex recognizer for loose phone numbers (8-15 digits, optional +, -, spaces, or parentheses)
        phone_pattern = Pattern(
            name="loose_phone",
            regex=r"\b\+?\d[\d\s\-\(\)]{6,13}\d\b",
            score=0.5
        )
        custom_phone_recognizer = PatternRecognizer(
            supported_entity="PHONE_NUMBER", 
            patterns=[phone_pattern],
            context=["phone", "contact", "call", "whatsapp", "number"]
        )
        self.analyzer.registry.add_recognizer(custom_phone_recognizer)
        
        self.anonymizer = AnonymizerEngine()
        
    def sanitize(self, text: str) -> str:
        # Analyze the text for PII
        results = self.analyzer.analyze(text=text, entities=["PHONE_NUMBER", "EMAIL_ADDRESS", "PERSON", "LOCATION"], language='en')
        
        # Anonymize the findings
        anonymized_result = self.anonymizer.anonymize(text=text, analyzer_results=results)
        
        return anonymized_result.text
