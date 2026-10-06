# LifeOS — Alexa+ Guardian Hackathon Demo Script

> **Winning Pitch:**
> *“Alexa can answer a question. Guardian protects an objective.”*

---

## Demo Step-by-Step Flow

### 1. The Opening Pitch (30 seconds)
- **Speaker:** "Traditional voice assistants are reactive. You ask: *'Set a reminder for 8 AM'* or *'What is the traffic?'*. But humans don't care about reminders; humans care about **outcomes**."
- **The Guardian Difference:** "With LifeOS Guardian, you give Alexa a high-level objective: *'Make sure I reach my hackathon tomorrow by 9 AM and my team is ready.'* Guardian continuously watches what could go wrong, reasons over task dependencies, calculates arrival buffers, and protects the goal until it's done."

---

### 2. Scene 1: Baseline Goal Initialization
1. In the console or voice prompt, submit:
   > *"Alexa, make sure I reach my hackathon tomorrow by 9 AM and my team is ready."*
2. **Observe in Dashboard:**
   - **Active Goal**: "Attend Amazon Alexa+ Hackathon"
   - **Deadline**: Tomorrow 9:00 AM (Innovation Hall 4)
   - **Progress**: 78%
   - **Criteria Status**:
     - Presentation: **READY** (Priya finished slides)
     - Demo Testing: **BLOCKED** (Waiting for backend deployment)
     - Travel: **READY** (ETA 45m, Arrival 8:30 AM, Buffer 30 minutes)
     - Team: **2/3 READY** (Rahul still working on backend deliverable)
   - **Risk Level**: **MEDIUM** (Score 45/100, due to incomplete backend)

---

### 3. Scene 2: Injecting the Unexpected Disruption
1. In the **Disruption Simulator** panel, click:
   > **`[ +33m TRAFFIC DELAY ]`**
2. **What Happens Under the Hood:**
   - Highway traffic increases due to congestion.
   - Travel ETA jumps: **45m &rarr; 78m**.
   - Arrival time moves to **8:55 AM**, leaving only a **5-minute buffer** before the 9:00 AM deadline.

---

### 4. Scene 3: What Changed? & Risk Escalation
1. Ask Alexa:
   > *"What changed?"*
2. **Guardian Response:**
   > *"Traffic on Highway 101 increased your travel time by 33 minutes. Your arrival buffer has dropped from 30 minutes to 5 minutes, placing your 9:00 AM deadline at HIGH risk."*
3. **Observe in Dashboard:**
   - **Risk Card** turns **HIGH RISK** (Score 82/100).
   - Explainable reasons clearly displayed: *"Travel buffer is only 5 minutes before 9:00 AM deadline."*

---

### 5. Scene 4: Autonomous Replanning with Guardian
1. Guardian autonomously executes `replan_goal`:
   - Calculates uncongested alternative routes.
   - Finds **Blue Line Metro + Innovation Express Shuttle** (ETA 52m, arrives at **8:32 AM**, restoring **28 minutes of buffer**).
   - Detects that **Rahul's backend** is blocking **demo testing**.

---

### 6. Scene 5: Consequence-Aware Permissions (Human-in-the-Loop)
1. **Explain to Judges:**
   - "Guardian does not blindly take actions that alter real-world itineraries or send unauthorized messages. It respects consequence boundaries."
2. **Observe Approval Dialog:**
   - **Action 1**: Switch to Dedicated Express Transit Route (Medium Risk)
   - **Action 2**: Send Urgent Blocker Alert to Rahul via Slack (Medium Risk)
3. User confirms:
   > *"Take the alternative."*
4. Click **[ APPROVE ACTION ]** on the Transit Route.
   - Route updates to Express Transit.
   - Travel buffer is restored to **28 minutes**.
5. User confirms:
   > *"Yes, message Rahul."*
6. Click **[ APPROVE ACTION ]** on the Slack message.
   - Message dispatched to Rahul: *"Your backend deployment is currently blocking demo testing..."*
   - Delivery verified via simulated gateway.

---

### 7. Scene 6: Goal Protected
1. Ask Alexa:
   > *"Alexa, brief me."*
2. **Guardian Response:**
   > *"You're now on track. Travel is safe with 28 minutes of buffer via the Express Route, your presentation is ready, and Rahul has been notified about the backend blocker."*
3. **Dashboard Final State:**
   - Travel: **READY (Buffer 28m)**
   - Risk: **LOW / MANAGED**
   - Goal Status: **Protected & On Track**
