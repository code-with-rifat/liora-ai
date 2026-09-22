import os
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# ==========================================
# 1. LOAD KNOWLEDGE FILES FROM FOLDER
# ==========================================
DOCUMENT_DIR = "../knowledge_base/" if os.path.exists("../knowledge_base/") else "./knowledge_base/"
print(f"[+] Loading knowledge documents from {DOCUMENT_DIR}...")
loader = DirectoryLoader(DOCUMENT_DIR, glob="**/*.txt", loader_cls=TextLoader)
documents = loader.load()
print(f"[+] Loaded {len(documents)} source files.")

# ==========================================
# 2. SPLIT TEXT INTO MANAGEABLE CHUNKS
# ==========================================
print("[+] Splitting text into chunks (size=500, overlap=50)...")
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", " ", ""]
)
docs = text_splitter.split_documents(documents)
print(f"[+] Generated {len(docs)} text chunks for vector indexing.")

# ==========================================
# 3. CREATE VECTOR STORE EMBEDDINGS
# ==========================================
print("[+] Embedding documents with sentence-transformers/all-MiniLM-L6-v2...")
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vectorstore = Chroma.from_documents(
    documents=docs,
    embedding=embedding_model,
    persist_directory="./chroma_db"
)
print("[✓] Vector index stored in ./chroma_db")

# ==========================================
# 4. CONTEXT RETRIEVAL FUNCTION
# ==========================================
def get_relevant_context(query: str, k: int = 3) -> str:
    retriever = vectorstore.as_retriever(search_kwargs={"k": k})
    relevant_docs = retriever.invoke(query)
    context = "\n---\n".join([doc.page_content for doc in relevant_docs])
    return context

if __name__ == "__main__":
    sample_query = "Who is the creator of this AI and what is his tech stack?"
    print(f"\n[Test Query]: {sample_query}")
    ctx = get_relevant_context(sample_query)
    print("\n--- Retrieved Context ---")
    print(ctx)
    print("-------------------------\n")
