# Mastery bands
BAND_STRUGGLING  = (0,  40)   # revise, easy practice, heavy explanation
BAND_DEVELOPING  = (40, 70)   # guided practice, medium difficulty
BAND_COMPETENT   = (70, 85)   # hard practice, edge cases
BAND_MASTERED    = (85, 101)  # advance to the next topic

# Difficulty weighting — a hard question is worth more evidence
DIFFICULTY_WEIGHT = {"easy": 0.80, "medium": 1.00, "hard": 1.25}

# EMA learning rates
ALPHA_FIRST  = 0.50   # first observation for a topic moves it a lot
ALPHA_REPEAT = 0.30   # later observations move it less

# Prerequisite gates
PREREQ_UNLOCK = 60    # prerequisite must reach this to unlock a topic
PREREQ_RELOCK = 50    # dropping below this re-locks dependents (hysteresis)

# Trend detection
TREND_WINDOW = 3      # last N attempts
TREND_DELTA  = 8.0    # points of change that counts as a real trend

# Quiz sizing
QUIZ_QUESTIONS       = 5
DIAGNOSTIC_QUESTIONS = 10
