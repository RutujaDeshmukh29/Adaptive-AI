# 00 — Pre-Hackathon Checklist (DO THIS TONIGHT)

> **Read this first. It is the highest-value document in this folder.**
>
> Teams do not lose hackathons because their idea was weak. They lose the first three hours to `pip install`, a Postgres connection string that doesn't work, and a 90 MB model download on conference Wi-Fi.

---

## ⚖️ The rule we must respect

The hackathon requires the project to be **built from scratch during the event**.

| ✅ Allowed tonight | ❌ Not allowed tonight |
|---|---|
| Installing Python, Node, VS Code, Git | Writing any AdaptEd AI source code |
| Creating accounts (GitHub, Supabase, Google AI Studio) | Creating the repo's application files |
| Getting API keys | Scaffolding `backend/app/` |
| Downloading the embedding model to local cache | Writing models, routes, services, components |
| Pre-installing pip / npm packages into a throwaway folder | Copying anything from the old AI Learning Companion project |
| Reading docs, reading this folder | Pre-building UI pages |
| Writing the presentation and demo narration | — |
| Preparing sample PDFs | — |

**Environment preparation is not project work.** Everyone does it. Code written before hour zero is disqualifiable. Keep the line clean and you have nothing to worry about.

---

## 1. Accounts & Keys (30 minutes)

### 1.1 Google Gemini API key

1. Go to <https://aistudio.google.com/apikey>
2. Sign in with a Google account → **Create API key**
3. Copy it into your phone notes **and** a text file on the laptop
4. **Note which Flash models are listed as available on the free tier** — write the exact model string down. Free tier covers Flash and Flash-Lite models; Pro models require billing.
5. Test it right now (see §4)

> **Create a second key on a different Google account.** Free tiers have daily request caps. At 4am, a spare key is worth more than sleep.

### 1.2 Supabase (PostgreSQL)

1. Go to <https://supabase.com> → sign in with GitHub
2. **New Project** → name `adapted-ai`, choose the region closest to you, set a **strong DB password and save it**
3. Wait for provisioning (~2 minutes)
4. **Project Settings → Database → Connection string → URI**
5. Copy it. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxx.supabase.co:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with the real password. Save it.
7. If the direct connection is blocked on your network, use the **Session pooler** connection string instead (port `6543`) — venue Wi-Fi often blocks 5432.

> **Backup plan:** also install PostgreSQL locally, *or* be ready to switch `DATABASE_URL` to `sqlite:///./adapted.db`. With SQLAlchemy that is a one-line change. Decide the switch rule in advance: **if the DB isn't connecting by hour 1, switch to SQLite and move on.** (`JSONB` columns become `JSON` — plan for it.)

### 1.3 GitHub

- Create an **empty private repo** named `adapted-ai` (no README, no .gitignore — we create those at hour zero)
- Add all four teammates as collaborators
- Confirm `git` is configured on the laptop:
  ```bash
  git config --global user.name "Rutuja Deshmukh"
  git config --global user.email "your@email.com"
  ```
- Test that you can push (create a scratch repo, push, delete it)

---

## 2. Install the toolchain (45 minutes)

```bash
python --version      # need 3.11 or 3.12
node --version        # need 18+ or 20+
npm --version
git --version
```

Install anything missing:

| Tool | Where |
|---|---|
| Python 3.11/3.12 | <https://python.org/downloads> — **tick "Add to PATH"** |
| Node.js LTS | <https://nodejs.org> |
| Git | <https://git-scm.com> |
| VS Code | <https://code.visualstudio.com> |

### VS Code extensions

Python · Pylance · ES7+ React snippets · Tailwind CSS IntelliSense · Prettier · Thunder Client · GitLens · Error Lens

---

## 3. Warm the caches (60 minutes — the most important step)

Do this in a **throwaway folder** (`~/prep-scratch`), not in a project folder. Delete it before the event or just ignore it. The point is that pip, npm and HuggingFace all keep global caches — after tonight, tomorrow's installs are near-instant and work offline.

### 3.1 Python packages

```bash
mkdir prep-scratch && cd prep-scratch
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install --upgrade pip
pip install fastapi uvicorn[standard] pydantic pydantic-settings sqlalchemy \
  psycopg2-binary python-jose[cryptography] passlib[bcrypt] python-multipart \
  python-dotenv google-genai PyMuPDF sentence-transformers chromadb
```

`sentence-transformers` pulls PyTorch. On a slow connection this is **20–40 minutes**. Doing it tomorrow morning would cost you a tenth of the hackathon.

### 3.2 Download the embedding model into cache

```python
# save as prep-scratch/warm.py and run it
from sentence_transformers import SentenceTransformer
m = SentenceTransformer("all-MiniLM-L6-v2")
v = m.encode(["adaptive learning test sentence"])
print("embedding dim:", len(v[0]))   # expect 384
```

```bash
python warm.py
```

This downloads ~90 MB to `~/.cache/huggingface`. Once cached, it loads instantly tomorrow — **even with no internet**.

### 3.3 Node packages

```bash
npx create-next-app@latest prep-next --ts --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --no-turbopack
cd prep-next
npm install recharts lucide-react axios clsx tailwind-merge class-variance-authority
npx shadcn@latest init
npx shadcn@latest add button card input label select progress tabs dialog \
  badge avatar skeleton toast textarea separator
npm run dev        # confirm it boots on :3000, then Ctrl+C
```

Now delete `prep-next`. The npm cache is warm; tomorrow's `create-next-app` and `npm install` will be dramatically faster.

### 3.4 Verify ChromaDB works

```python
# prep-scratch/chroma_test.py
import chromadb
c = chromadb.PersistentClient(path="./_chroma_test")
col = c.get_or_create_collection("t")
col.add(ids=["1"], documents=["loops repeat a block of code"])
print(col.query(query_texts=["what is a loop"], n_results=1))
```

If this prints a result, your vector store is good to go.

---

## 4. Verify Gemini works (15 minutes)

```python
# prep-scratch/gemini_test.py
from google import genai

client = genai.Client(api_key="PASTE_YOUR_KEY")

# 1) list the models your key can actually use — WRITE DOWN a Flash model ID
for m in client.models.list():
    print(m.name)

# 2) plain text call
r = client.models.generate_content(
    model="gemini-3.6-flash",           # replace with a model from the list above
    contents="Explain Python loops to a beginner in 2 sentences.",
)
print(r.text)

# 3) THE IMPORTANT ONE — strict JSON output
r2 = client.models.generate_content(
    model="gemini-3.6-flash",
    contents=(
        "Generate 2 multiple-choice questions about Python loops. "
        'Return ONLY valid JSON: {"questions":[{"question":"","options":["","","",""],'
        '"correct_index":0,"explanation":"","concept_tag":""}]} '
        "No markdown, no code fences."
    ),
)
print(r2.text)
```

**What to record in your notes tonight:**

- [ ] The exact working model string
- [ ] Whether the JSON came back clean or wrapped in ` ```json ` fences (it usually is — that is why `safe_json()` exists in the plan)
- [ ] Rough response latency

If the SDK import shape differs from the above, check <https://ai.google.dev/gemini-api/docs> — the quickstart there is authoritative and takes two minutes to read.

---

## 5. Prepare demo assets (Manthan + Prathamesh, 45 minutes)

| Asset | Detail |
|---|---|
| **Sample PDF #1** | A 10–20 page Python notes PDF covering variables, loops, functions, lists. This is what we upload live. **Text-based, not scanned images.** |
| **Sample PDF #2** | A backup, different subject or shorter — in case #1 parses badly |
| **Verify** | Open each in a PDF reader and try selecting text. If text won't select, PyMuPDF can't extract it. Find another file. |
| **Demo narration** | Written out, 3–4 minutes, rehearsed aloud at least twice |
| **Judge Q&A sheet** | See `06_DEMO_SCRIPT.md` §Q&A |
| **Presentation** | The TECHFUSION deck, updated with final screenshots at hour 22 |

### ⚠️ One naming decision to make tonight

Your context doc says **"AdaptEd AI"**. Your submitted PPT says **"ADAPTED AI"**. These are different names, and judges notice inconsistency between the deck, the repo and the live app.

Pick one **tonight** and use it everywhere — deck, README, landing page, repo name, verbal pitch.

> Recommendation: **AdaptEd AI** — "Adapt" + "Ed(ucation)", and it directly supports the tagline *"Not a fixed study plan — a learning journey that adapts to you."* "Adapted" is past tense, which works against the whole "continuously adapting" message. But it's your call — just make it once, and make it stick.

---

## 6. Logistics (Prathamesh)

- [ ] Laptop charger + **extension board / power strip** (venues never have enough sockets)
- [ ] Mobile hotspot ready on at least two phones + data recharged
- [ ] Laptop battery health checked; sleep/hibernate disabled for the event
- [ ] Mouse (trackpad for 24 hours is genuinely painful)
- [ ] Water bottles, snacks, caffeine of choice
- [ ] Notebook + pen for the tracker's checklist
- [ ] HDMI/Type-C-to-HDMI adapter for the demo projector — **test it beforehand**
- [ ] Phone charger + power bank
- [ ] Confirm reporting time, venue, submission deadline and submission method

---

## 7. Final pre-flight (10 minutes, night before sleeping)

```bash
python --version && node --version && git --version
```

- [ ] Gemini test script ran successfully; model string written down
- [ ] Supabase connection string saved and tested (or SQLite fallback decided)
- [ ] `all-MiniLM-L6-v2` cached locally (verify: `~/.cache/huggingface` exists and is ~90 MB+)
- [ ] All heavy pip packages installed at least once
- [ ] npm cache warm
- [ ] GitHub repo created, collaborators added, push tested
- [ ] Both sample PDFs verified as text-extractable
- [ ] Name decision made (AdaptEd AI vs ADAPTED AI)
- [ ] All four teammates have read `01_HACKATHON_24H_PLAN.md` and `02_TEAM_ROLES_AND_TASKS.md`
- [ ] This documentation folder is on the laptop **and** in a cloud drive **and** on a pen drive

---

## 8. Sleep

Non-negotiable: **get 7 hours tonight.**

You are the only person who can code, on the only laptop. Your rested brain at hour 18 is worth more than anything you could prepare at midnight tonight. Hour 18 is when the integration bugs appear, and hour 18 is decided by how you sleep tonight.

Close the laptop.
