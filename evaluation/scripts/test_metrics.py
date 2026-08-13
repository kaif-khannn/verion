import unittest
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from evaluation.scripts.calculate_metrics import (
    calculate_information_coverage,
    calculate_specification_accuracy,
    calculate_hallucination_rate,
    evaluate_pii_v2,
    calculate_visual_attribute_recall,
    clean_fact_value
)

class TestMetrics(unittest.TestCase):
    
    def test_clean_fact_value(self):
        self.assertEqual(clean_fact_value("15-inch Full HD (probable)"), "15-inch full hd")
        self.assertEqual(clean_fact_value("₹4,999 or ₹5,499 (conflicting)"), "₹4,999 or ₹5,499")
        
    def test_information_coverage(self):
        facts = {"brand": "Sony", "battery": "30-hour"}
        out_text = "This is a Sony headphone with 30-hour battery life."
        self.assertEqual(calculate_information_coverage(out_text, facts), 100.0)
        
        out_text_partial = "This is a Sony headphone."
        self.assertEqual(calculate_information_coverage(out_text_partial, facts), 50.0)

    def test_specification_accuracy(self):
        facts = {"storage": "512GB SSD"}
        out_text = "Storage is 512GB SSD."
        self.assertEqual(calculate_specification_accuracy(out_text, facts), 100.0)

    def test_pii_v2(self):
        pii_data = {"present": True, "fields": ["email", "phone"]}
        input_text = "Contact at john@test.com or 555-555-1234."
        
        out_leak = "Email john@test.com for info."
        res_leak = evaluate_pii_v2(out_leak, pii_data, input_text)
        self.assertEqual(res_leak["leakage_rate_pct"], 50.0)
        
        out_safe = "Contact customer service."
        res_safe = evaluate_pii_v2(out_safe, pii_data, input_text)
        self.assertEqual(res_safe["leakage_rate_pct"], 0.0)

    def test_visual_attribute_recall(self):
        visuals = ["Laptop", "Silver color"]
        out_text = "A silver laptop."
        self.assertEqual(calculate_visual_attribute_recall(out_text, visuals), 100.0)

if __name__ == '__main__':
    unittest.main()
