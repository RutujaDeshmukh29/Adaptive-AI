from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models.topic import Topic

PYTHON_TOPICS = [
    {"name": "Variables",     "slug": "variables",     "order": 1,  "prerequisite": None},
    {"name": "Data Types",    "slug": "data-types",    "order": 2,  "prerequisite": "variables"},
    {"name": "Operators",     "slug": "operators",     "order": 3,  "prerequisite": "variables"},
    {"name": "Conditionals",  "slug": "conditionals",  "order": 4,  "prerequisite": "operators"},
    {"name": "Loops",         "slug": "loops",         "order": 5,  "prerequisite": "conditionals"},
    {"name": "Functions",     "slug": "functions",     "order": 6,  "prerequisite": "loops"},
    {"name": "Lists",         "slug": "lists",         "order": 7,  "prerequisite": "loops"},
    {"name": "Dictionaries",  "slug": "dictionaries",  "order": 8,  "prerequisite": "lists"},
    {"name": "Strings",       "slug": "strings",       "order": 9,  "prerequisite": "data-types"},
    {"name": "OOP Basics",    "slug": "oop",           "order": 10, "prerequisite": "functions"},
]

def seed_topics(db: Session):
    subject = "Python"
    
    # Check if already seeded
    existing = db.query(Topic).filter(Topic.subject == subject).first()
    if existing:
        print("Topics already seeded.")
        return

    # Keep track of created topics to resolve prerequisites
    slug_to_id = {}

    for t_data in PYTHON_TOPICS:
        prereq_slug = t_data["prerequisite"]
        prereq_id = slug_to_id.get(prereq_slug) if prereq_slug else None

        new_topic = Topic(
            subject=subject,
            name=t_data["name"],
            slug=t_data["slug"],
            order_index=t_data["order"],
            prerequisite_id=prereq_id
        )
        db.add(new_topic)
        db.commit()
        db.refresh(new_topic)
        
        slug_to_id[t_data["slug"]] = new_topic.id

    print("Successfully seeded Python topics.")

if __name__ == "__main__":
    db = SessionLocal()
    seed_topics(db)
    db.close()
