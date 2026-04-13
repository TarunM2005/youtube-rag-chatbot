from rag import get_transcript, build_db, ask_rag

video_id = "dQw4w9WgXcQ"

print("Fetching transcript...")
text = get_transcript(video_id)

print("Building vector DB...")
db = build_db(text)

while True:
    question = input("\nAsk a question (type 'exit' to quit): ")
    
    if question.lower() == "exit":
        break

    answer = ask_rag(db, question)
    print("\nAnswer:", answer)