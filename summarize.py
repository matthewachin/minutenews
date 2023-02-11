import spacy

nlp = spacy.load("en_core_web_trf")

def summarize_text(text, ratio=0.3):
    doc = nlp(text)
    sentences = [sent.text for sent in doc.sents]
    num_sentences = int(len(sentences) * ratio)
    return " ".join(sentences[:num_sentences])

text = "This is a long and boring text. It has too many sentences. We need to summarize it. The idea is to only keep the most important sentences."

summary = summarize_text(text)
print("Original Text: \n", text)
print("\nSummary: \n", summary)