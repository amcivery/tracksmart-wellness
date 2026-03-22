// ─── Types ────────────────────────────────────────────────────────────────────

export type Device = "oura" | "whoop" | "garmin" | "cross-device";
export type Intent =
  | "pain-point"
  | "informational"
  | "decision-making"
  | "actionable"
  | "comparison";
export type Priority = "high" | "medium";

export interface GuideSection {
  heading: string;
  /** Paragraphs separated by \n\n. Lines beginning with a digit+period are rendered as numbered list items. */
  body: string;
}

export interface GuideFaq {
  question: string;
  answer: string;
}

export interface RelatedTool {
  href: string;
  label: string;
  description: string;
}

export interface Guide {
  slug: string;
  device: Device;
  intent: Intent;
  priority: Priority;
  /** Short title shown on cards and breadcrumbs */
  title: string;
  /** Full SEO title for <title> tag */
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  publishedAt: string; // ISO date
  /** 1-2 paragraph hook rendered above the first section */
  intro: string;
  sections: GuideSection[];
  faq?: GuideFaq[];
  relatedTool?: RelatedTool;
  /** Slugs of other guides to surface at the bottom */
  relatedGuides?: string[];
}

// ─── Device metadata ──────────────────────────────────────────────────────────

export const deviceMeta: Record<
  Device,
  { label: string; color: string; bg: string; border: string }
> = {
  oura: {
    label: "Oura Ring",
    color: "text-cyan-300",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
  },
  whoop: {
    label: "Whoop",
    color: "text-emerald-300",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
  garmin: {
    label: "Garmin",
    color: "text-violet-300",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
  },
  "cross-device": {
    label: "All Devices",
    color: "text-amber-300",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
  },
};

// ─── Guide data ───────────────────────────────────────────────────────────────

export const guides: Guide[] = [
  // ── GUIDE 1 ──────────────────────────────────────────────────────────────
  {
    slug: "why-is-my-oura-readiness-score-low",
    device: "oura",
    intent: "pain-point",
    priority: "high",
    title: "Why Is My Oura Readiness Score Low?",
    metaTitle: "Why Is My Oura Readiness Score Low? (7 Most Common Causes)",
    metaDescription:
      "A low Oura readiness score can feel confusing after a full night of sleep. This plain-English guide covers the 7 most common causes and exactly what to do about each one.",
    keywords: [
      "why is my oura readiness score low",
      "oura readiness score low",
      "low oura readiness score causes",
      "oura readiness score explained",
    ],
    publishedAt: "2026-03-01",
    intro:
      "You went to bed at a reasonable hour, got a full night of sleep, and woke up expecting a solid readiness score — only to find it sitting in the 50s or 60s. This happens to almost every Oura user at some point, and it is almost always explainable once you know what the algorithm is actually weighing.\n\nA low Oura readiness score is not simply a reflection of how many hours you slept. It is a composite signal built from multiple physiological inputs, and any one of them can pull the score down significantly — even when everything else looks fine. This guide walks through the most common reasons your readiness score drops, what each one means for your body, and how to tell whether you are dealing with something you can fix today or a pattern that needs a longer-term response.",
    sections: [
      {
        heading: "What Oura's Readiness Score Is Actually Built From",
        body: "Most people assume readiness equals sleep. That is only partly true. Oura combines several distinct inputs to generate your daily score.\n\nHRV balance compares your last night's HRV to your 30-day rolling average. A single night below your baseline will not tank your score dramatically, but several consecutive nights of suppressed HRV will accumulate into a meaningful drop. Resting heart rate works similarly — Oura flags elevated resting heart rate as a sign that your body is working harder than usual, whether from illness, stress, alcohol, or insufficient recovery.\n\nBody temperature deviation is one of the more sensitive inputs. A spike of even half a degree Celsius above your personal baseline can meaningfully drag readiness down, and this is often the signal that surfaces earliest when you are getting sick. Sleep timing and regularity matter independently of total sleep time — irregular schedules suppress your score even when you sleep plenty. And recent activity history means that hard training days carry into the following day's score through what Oura calls activity balance.",
      },
      {
        heading: "The 7 Most Common Reasons for a Low Score",
        body: "1. HRV suppression from the previous day's training. Intense workouts — especially strength training, intervals, or long endurance efforts — can depress HRV for 24 to 48 hours. If you went hard yesterday, a lower readiness today is the expected physiological response, not a malfunction.\n\n2. Alcohol. Even a small amount meaningfully disrupts HRV and sleep architecture. Oura's temperature and resting heart rate sensors frequently detect alcohol's downstream effects even if you felt fine the next morning.\n\n3. Elevated body temperature. This can come from illness, ovulation, environmental heat, or late-night eating. Oura cannot distinguish between these causes, so any thermal stress registers as a readiness drag.\n\n4. Poor sleep timing or short sleep. Going to bed significantly later than usual, or sleeping fewer than six hours, will both reduce your score — even if your sleep efficiency looks high.\n\n5. Accumulated sleep debt. If you have run a deficit for several nights in a row, your score reflects the cumulative hole rather than just last night's sleep. A single good night rarely fully recovers a multi-day deficit.\n\n6. High life stress. Emotional and psychological stress raise cortisol, which suppresses HRV. Oura does not know you had a difficult week at work, but your HRV does.\n\n7. Illness onset. A falling readiness score paired with elevated body temperature and elevated resting heart rate is often the first measurable signal that you are getting sick — sometimes 24 to 36 hours before you feel it.",
      },
      {
        heading: "When a Low Score Is Normal vs. When to Pay Attention",
        body: "A single low score following a hard workout, a late night, or a stressful day is entirely expected and should not alarm you. The score is working correctly.\n\nThe pattern to watch for is consecutive low scores without an obvious cause. Three or more days below 65 with normal sleep and no hard training suggests something systemic — overtraining, chronic stress, early illness, or a lifestyle factor that is accumulating quietly.\n\nIf your readiness score trends downward over one to two weeks, treat that as a real signal rather than a calibration quirk. The algorithm is designed to detect these multi-day patterns, and when it flags them persistently, it is usually right.",
      },
      {
        heading: "What to Do When Your Score Is Low",
        body: "The most effective immediate response depends on which contributors are dragging the score down. If HRV is the main culprit after a hard training day, the answer is lighter activity and prioritizing tonight's sleep. If body temperature is elevated, treat it as a potential illness signal and reduce all stressors. If resting heart rate is elevated without obvious cause, hydration and alcohol avoidance are often the fastest levers.\n\nFor the training decision specifically — whether to go hard, go easy, or skip entirely — a score below 60 generally favors easy movement over hard training. Between 60 and 69 is a judgment call based on your training context. Above 70, most contributors suggest your body is ready for normal output.\n\nYour Oura app's contributor breakdown is your most useful diagnostic tool. Whichever contributors are shown in orange or red are the actual problem, not a vague 'bad night' that requires a generic response.",
      },
    ],
    faq: [
      {
        question: "Does Oura readiness update throughout the day?",
        answer:
          "No. Your readiness score is calculated once overnight and reflects the previous night's data. It does not update in real time during the day.",
      },
      {
        question:
          "Can stress alone lower my readiness score even if I slept fine?",
        answer:
          "Yes. High psychological stress suppresses HRV independently of sleep duration or efficiency. If your HRV was lower than your average despite a full night of sleep, stress is a likely explanation.",
      },
      {
        question:
          "How many days does it usually take to recover a low readiness score?",
        answer:
          "For most people, one genuinely good night — good timing, no alcohol, no late training — will recover a moderate dip. A cumulative deficit from multiple bad nights typically takes two to three good nights to fully clear.",
      },
      {
        question: "Should I exercise when my Oura readiness is low?",
        answer:
          "It depends on how low. Below 60 generally favors easy movement or rest. Between 60 and 69, consider reducing intensity rather than skipping entirely. Use the Readiness Interpreter tool to get a specific recommendation based on your score and context.",
      },
    ],
    relatedTool: {
      href: "/tools/readiness-interpreter",
      label: "Readiness Score Interpreter",
      description:
        "Enter your score and context for a plain-English explanation and specific action plan. No sign-up required.",
    },
    relatedGuides: [
      "oura-readiness-score-60-meaning",
      "should-i-workout-with-low-oura-readiness",
    ],
  },

  // ── GUIDE 2 ──────────────────────────────────────────────────────────────
  {
    slug: "oura-readiness-score-60-meaning",
    device: "oura",
    intent: "informational",
    priority: "high",
    title: "Oura Readiness Score 60: What It Means",
    metaTitle: "Oura Readiness Score 60: What It Means & What to Do Today",
    metaDescription:
      "A readiness score of 60 puts you in Oura's 'pay attention' zone. This guide explains which contributors are likely pulling it down and how to make the right training and recovery decisions.",
    keywords: [
      "oura readiness score 60 meaning",
      "oura readiness score 60",
      "oura score 60 what does it mean",
      "oura readiness 60 should i workout",
    ],
    publishedAt: "2026-03-03",
    intro:
      "A readiness score of 60 puts you in a zone that Oura sometimes labels as 'pay attention,' and that description is accurate in a specific way. It does not mean your body is broken or that you need to spend the day horizontal — it means one or more physiological signals came in below your personal baseline, and your body has less reserve capacity than it does on a 75 or 80 day.\n\nThe practical difference between a 60 and a 70 is meaningful but often misunderstood. This guide explains exactly what a score of 60 tells you, which contributors are most likely pulling it to that level, and how to make sensible training and lifestyle decisions at this specific score.",
    sections: [
      {
        heading: "What Oura's Score of 60 Actually Means",
        body: "Oura uses a scale of 1 to 100, and scores between 60 and 69 represent moderate recovery with at least one meaningful contributor below your normal baseline. The algorithm does not simply average your numbers — it weights certain contributors more heavily, so a significant HRV suppression or a notably elevated resting heart rate can push you into the 60s even when your sleep looked reasonable on paper.\n\nAt 60, you are not in crisis territory, but you are also not running at full capacity. Think of it as roughly 70 to 80 percent of your top recovery state. Most physical and cognitive tasks are accessible, but high-intensity efforts will cost more and recover slower than they would on a high-readiness day.\n\nThe key distinction is between a 60 driven by a single contributor slightly below average versus a 60 driven by multiple contributors in the red. The first situation calls for modest adjustments. The second warrants more careful attention.",
      },
      {
        heading: "Which Contributors Are Most Likely Pulling You to 60",
        body: "The two most common culprits at a score of 60 are HRV balance and resting heart rate. HRV balance compares last night's HRV to your 30-day personal average — if it came in more than 10 to 15 percent below average, that single contributor can shift your score from the 70s into the 60s.\n\nResting heart rate elevation is the second most frequent driver. Even two to three beats above your norm — common after alcohol, late eating, high stress, or a hard training day — registers as a meaningful readiness drag. Sleep timing irregularity and a body temperature blip above baseline are the next most common factors at this score level.\n\nWhen you see a 60, open your Oura app's contributor breakdown before doing anything else. Whichever indicators are shown in orange or red are your actual problem — and that tells you where to focus your recovery effort tonight, not a generic plan to 'sleep more.'",
      },
      {
        heading: "What to Do About Training When Your Readiness Is 60",
        body: "A score of 60 does not automatically mean rest. For experienced athletes, a 60 is a signal to manage load — not a stop sign. The right response depends on what tomorrow and the rest of your week look like.\n\nIf today is a planned easy day anyway, proceed as normal. If you had a hard session planned, consider scaling the intensity down one level: threshold work becomes tempo, tempo becomes a steady aerobic effort. The volume can stay the same, but the intensity ceiling matters.\n\nWhere a score of 60 is most important to respect is when you are already in a high-stress training block or dealing with accumulated fatigue. In that context, pushing through on a 60 day extends your recovery debt rather than building fitness. The compound effect of several 60-day hard efforts in a row without a full recovery day is what produces overreaching.\n\nFor non-athletes, a 60 is simply a useful prompt to be more intentional about today's demands. Avoid adding unnecessary stressors when you do not have to.",
      },
      {
        heading: "How to Get Back to 70+ After a Score of 60",
        body: "The fastest path from a 60 back to 70-plus is usually one well-executed night. Prioritize sleep timing above total hours — getting to bed within your normal 30-minute window matters more than sleeping an extra hour at an irregular time. Avoid alcohol completely that evening, eat your last meal at least two to three hours before bed, and keep the room cool and dark.\n\nIf your 60 was driven by HRV suppression from training, a short walk or light stretching during the day can support parasympathetic recovery better than complete sedentary rest. Staying well hydrated throughout the day is a supporting factor that consistently gets underrated in recovery discussions.\n\nMost people who score 60 after a hard day or a slightly late night will return to 70 or above the next morning with no special intervention beyond protecting that night's sleep.",
      },
    ],
    faq: [
      {
        question: "Is a readiness score of 60 normal?",
        answer:
          "Yes. Most Oura users spend a meaningful portion of their time in the 60-74 range. A score of 60 is a yellow light, not a red one. It reflects moderate recovery with room for improvement.",
      },
      {
        question: "Should I skip the gym if my Oura score is 60?",
        answer:
          "Not necessarily. A score of 60 favors reduced intensity rather than full rest for most people. Easy to moderate training is generally fine. Use the Readiness Interpreter for a personalized recommendation based on your specific contributors.",
      },
      {
        question: "Does a readiness score of 60 mean I am getting sick?",
        answer:
          "Not by itself. Illness typically shows as a dropping score paired with elevated body temperature. A 60 driven only by HRV or resting heart rate is more likely training or lifestyle-related.",
      },
      {
        question: "What is the difference between a readiness score of 60 and 65?",
        answer:
          "Both are in the moderate recovery range, but a 65 often reflects a single contributor slightly below average while a 60 typically reflects a more significant dip in at least one input. The contributor breakdown in your Oura app tells you the specific story.",
      },
    ],
    relatedTool: {
      href: "/tools/readiness-interpreter",
      label: "Readiness Score Interpreter",
      description:
        "Enter your score of 60 (or any score) to get a plain-English breakdown and specific action plan for today.",
    },
    relatedGuides: [
      "why-is-my-oura-readiness-score-low",
      "should-i-workout-with-low-oura-readiness",
    ],
  },

  // ── GUIDE 3 ──────────────────────────────────────────────────────────────
  {
    slug: "should-i-workout-with-low-oura-readiness",
    device: "oura",
    intent: "decision-making",
    priority: "high",
    title: "Should I Work Out With a Low Oura Readiness Score?",
    metaTitle:
      "Should You Work Out With a Low Oura Readiness Score? A Clear Guide",
    metaDescription:
      "The answer is not always rest — and it is not always train. This guide gives you a practical decision framework for working out at any readiness score, without ignoring the data or over-reacting to it.",
    keywords: [
      "should i workout with low oura readiness",
      "oura readiness score low workout",
      "low readiness score what to do",
      "oura readiness score exercise decision",
    ],
    publishedAt: "2026-03-05",
    intro:
      "This is the question every wearable user wrestles with at some point. You have a training session scheduled, your Oura score is lower than you would like, and you are not sure whether pushing through is sensible or counterproductive. The honest answer is: it depends on how low, why it is low, and what you have planned.\n\nThis guide gives you a practical decision framework — not a blanket 'always rest when low' rule, which is too simplistic for anyone who trains seriously, and not a 'ignore the score and train anyway' dismissal, which misses the entire point of wearing the device.",
    sections: [
      {
        heading: "What 'Low' Actually Means: Below 60 vs. 60-69",
        body: "Oura does not have a single threshold for 'low.' In practice, most users and coaches treat scores below 60 as a genuine recovery signal that warrants modifying the plan. Scores between 60 and 69 are a judgment zone that depends heavily on context. Scores above 70 are generally green-light territory for normal training.\n\nThe distinction matters because responding the same way to a score of 55 and a score of 68 is like driving the same speed on a foggy night and a clear afternoon. A 55 often means multiple contributors are suppressed simultaneously — low HRV, elevated resting heart rate, flagged body temperature. A 68 might mean just one contributor pulled slightly below average and everything else checked out fine.\n\nBefore deciding anything, open your contributor breakdown. A 63 driven only by slightly suppressed HRV is a very different situation than a 63 driven by elevated temperature, high resting heart rate, and poor sleep timing all at once.",
      },
      {
        heading: "When Training Through a Low Score Makes Sense",
        body: "There are specific situations where training despite a lower readiness score is the right call:\n\nYou are in a competitive or periodization-specific phase where missing a session has outsized consequences for your training block. One disrupted workout during peak prep is often more costly than the recovery risk of a modified effort on a 62 day.\n\nYou have been consistently in the 60-68 range for two or more weeks with no clear cause and no symptoms. At some point the data is reflecting your new normal, not a recovery deficit — especially if you feel functionally fine and performance has not dropped.\n\nThe score dropped for a known, benign reason — a late night out, a single drink at dinner, or a time zone shift — and you feel genuinely good subjectively. Your subjective state and your readiness score together give better information than either one alone. If they agree that you feel off, take that seriously. If your body says yes and only the number says no, context matters.\n\nYou have a lower-intensity session planned. Easy aerobic work, mobility, or light lifting is unlikely to dig your recovery hole deeper even on a 60-day, and maintaining the habit has value.",
      },
      {
        heading: "When a Low Score Is a Real Reason to Hold Back",
        body: "Rest is the right call when the score has been trending down across multiple consecutive days. A single 58 after a hard weekend is noise. Four consecutive days in the 55-62 range is a pattern, and training harder into that pattern will worsen it, not resolve it.\n\nAlso hold back when the score is low and your body temperature is elevated, which can signal early illness. Training when your immune system is already under stress is one of the fastest ways to turn a mild bug into a two-week setback.\n\nFinally, consider holding back when yesterday's hard session is the specific thing that drove today's score low. If Thursday's tempo run is why Friday's score is 58, doing another hard session Friday extends the debt without adding meaningful training stimulus. You are too fatigued for quality adaptation anyway.",
      },
      {
        heading: "Modified Training Options for Low-Readiness Days",
        body: "Rather than a binary train-or-rest decision, low-readiness days often call for a modified approach.\n\nDrop intensity by one zone. If you planned threshold intervals, do a steady aerobic effort instead. If you planned a long run, cut it to 60 percent of planned distance at an easy pace. You protect the training habit without adding to the recovery deficit.\n\nShift the type of work. Heavy strength training is harder to recover from than bodyweight movement or mobility work. Swapping a barbell session for 30 minutes of stretching and breathing work maintains your daily rhythm without the recovery cost.\n\nShorten the session. Half the volume at the planned intensity is often better than abandoning training entirely. It keeps your training consistency intact and does not push the recovery debt too far. Twenty minutes of focused work beats zero minutes and beats 60 minutes of going through the motions on a depleted day.",
      },
    ],
    faq: [
      {
        question: "What Oura readiness score is too low to work out?",
        answer:
          "Most coaches and users treat scores below 55 as a strong signal to rest or do only very gentle movement. Between 55 and 65, modify the session. Above 65, proceed with training adjusted to how you feel on the day.",
      },
      {
        question: "Can I build fitness on low-readiness days?",
        answer:
          "Very limited fitness adaptation occurs on deeply fatigued days because your body's recovery systems are already occupied with existing stress. Easy aerobic work on low-readiness days supports maintenance rather than meaningful development.",
      },
      {
        question: "Does working out on a low readiness day make things worse?",
        answer:
          "High-intensity training on an already-low readiness day typically extends recovery debt. Low-to-moderate intensity work generally does not make recovery meaningfully worse and can sometimes support it through improved circulation.",
      },
      {
        question: "Should I cancel my workout if my readiness dropped overnight?",
        answer:
          "Not automatically. Check why it dropped. A contributor breakdown showing one slightly suppressed input is very different from multiple red contributors. Use the score as an input to your decision, not as an automatic veto.",
      },
    ],
    relatedTool: {
      href: "/tools/readiness-interpreter",
      label: "Readiness Score Interpreter",
      description:
        "Enter your score and today's context — training load, sleep, stress — to get a specific training recommendation.",
    },
    relatedGuides: [
      "why-is-my-oura-readiness-score-low",
      "oura-readiness-score-60-meaning",
    ],
  },

  // ── GUIDE 4 ──────────────────────────────────────────────────────────────
  {
    slug: "whoop-recovery-red-should-i-train",
    device: "whoop",
    intent: "decision-making",
    priority: "high",
    title: "Whoop Recovery in the Red: Should You Train or Rest?",
    metaTitle:
      "Whoop Recovery in the Red: Should You Train or Rest? A Clear Guide",
    metaDescription:
      "Seeing red in your Whoop app does not always mean rest. This guide explains what red recovery actually represents and how to make the right training decision based on your specific score and context.",
    keywords: [
      "whoop recovery red should i train",
      "whoop recovery red meaning",
      "whoop red recovery workout or rest",
      "whoop recovery score red what to do",
    ],
    publishedAt: "2026-03-07",
    intro:
      "Seeing red in your Whoop app creates an immediate question: is this a hard stop, or is it a signal to dial things back? The answer depends on something Whoop itself does not always make clear — there is a significant difference between barely-red and deeply-red recovery, and your response to each should look different.\n\nThis guide walks through what Whoop's red recovery actually means, how to interpret it based on your individual numbers, and a practical framework for deciding whether to train, modify, or rest.",
    sections: [
      {
        heading: "What Whoop's Red Recovery Actually Represents",
        body: "Whoop displays recovery in three color zones: red (0-33%), yellow (34-66%), and green (67-100%). Red means your body's physiological readiness — as measured primarily by HRV, resting heart rate, and sleep performance — falls in the lowest third relative to your personal baseline.\n\nThe critical thing to understand is that Whoop's thresholds are personalized, not universal. A red score of 30% for someone with a high HRV baseline might reflect more physiological stress than a red score of 25% for someone with a naturally lower baseline. The color is relative to your own norms.\n\nRed also does not mean something is medically wrong. It means your nervous system is signaling that it needs more recovery time before it can perform at a high level. That is useful information — not an alarm.",
      },
      {
        heading: "Barely Red vs. Deeply Red: Why the Specific Number Matters",
        body: "A recovery of 28-33% sits at the high end of red and behaves more like a low-yellow than a deep-red. At this level, you are meaningfully suppressed but not at the floor. Light to moderate training is often reasonable, especially if it was already scheduled and you feel functionally alert.\n\nA recovery of 15% or lower is a different situation. At deep red, your HRV was likely significantly below baseline, your resting heart rate was elevated, and your sleep performance was poor. Training hard at this level is not building fitness — you are adding load to a system that is already struggling to process what it has received.\n\nWhoop shows you HRV, resting heart rate, and sleep performance as the three main contributors to your recovery score. Check those specific numbers, not just the color, before deciding how to respond. A 22% recovery driven primarily by one bad night looks different in practice than a 22% driven by HRV suppression, elevated RHR, and fragmented sleep simultaneously.",
      },
      {
        heading: "How to Think About Training on Red Days",
        body: "For recreational athletes and people primarily training for general health, red days are almost always a signal to reduce intensity or take an easy day. The marginal benefit of a hard session on a red day is low, and the recovery cost is higher than usual.\n\nFor competitive athletes with rigid training schedules, a high-red score (25-33%) does not necessarily mean canceling a planned session. It means executing it carefully — avoiding going deeper into effort than the session strictly demands, and prioritizing sleep and nutrition aggressively afterward.\n\nA useful real-world check: if you train on a red day and feel noticeably worse the next morning — lower recovery, heavier legs, a declining HRV trend — your body confirmed the signal was real. If you train on a high-red day and recover normally the next morning, the signal may have been a one-time trigger that has since cleared.",
      },
      {
        heading: "How to Use Red Days Strategically Rather Than Dreading Them",
        body: "The most useful reframe of a red recovery day is that your body is currently prioritizing recovery over performance. That process is productive — this is when adaptations from previous training are being consolidated. Interrupting it with another hard session delays that consolidation.\n\nStrategic use of red days includes easy active recovery work such as light walking or swimming, skill practice that does not require high physiological output, a genuine nutrition focus — this is a good day to eat well and hydrate aggressively — and sleep extension if your schedule allows.\n\nAthletes who consistently protect red days often report that their green-day performance improves over time. This happens because they are allowing full adaptation cycles to complete rather than compressing them, which is a smarter long-term approach than grinding through every day regardless of recovery state.",
      },
    ],
    faq: [
      {
        question: "Can I go to the gym if my Whoop recovery is red?",
        answer:
          "Yes, but adjust your plan. A warm-up and moderate effort is generally fine. Hard intervals, max lifts, or long threshold sessions are the things to avoid or postpone to a green or yellow day.",
      },
      {
        question: "Is Whoop red recovery always accurate?",
        answer:
          "Whoop's accuracy is highest when it is tracking a consistent pattern. Red can occasionally be a false signal after one unusual night — travel, time zones, or a single late night — without representing true physiological fatigue. Context and how you subjectively feel both matter.",
      },
      {
        question: "Does a red recovery mean I am overtrained?",
        answer:
          "One red day does not indicate overtraining. Multiple consecutive red days with a declining trend over weeks is a more meaningful signal. Single red days are common and expected in any active lifestyle.",
      },
      {
        question: "What is the best workout for a red recovery day?",
        answer:
          "Zone 2 aerobic work (conversational pace), yoga, swimming, or walking are the best options. These support blood flow and nervous system recovery without adding meaningful load. Keep sessions shorter than usual.",
      },
    ],
    relatedTool: {
      href: "/tools/hrv-optimizer",
      label: "HRV Optimizer",
      description:
        "Enter your Whoop recovery score and HRV to get a plain-English action plan for training, strain, and recovery.",
    },
    relatedGuides: [
      "why-is-my-whoop-recovery-always-red",
      "whoop-hrv-low-what-does-it-mean",
    ],
  },

  // ── GUIDE 5 ──────────────────────────────────────────────────────────────
  {
    slug: "why-is-my-whoop-recovery-always-red",
    device: "whoop",
    intent: "pain-point",
    priority: "high",
    title: "Why Is Your Whoop Recovery Always Red?",
    metaTitle:
      "Why Is Your Whoop Recovery Always Red? 8 Likely Reasons Explained",
    metaDescription:
      "If your Whoop recovery is chronically in the red zone, one or more of eight common factors is almost certainly responsible. This guide covers each one and includes a practical 5-day reset plan.",
    keywords: [
      "why is my whoop recovery always red",
      "whoop recovery chronically red",
      "whoop always red recovery causes",
      "whoop recovery stuck in red",
    ],
    publishedAt: "2026-03-10",
    intro:
      "An occasional red recovery day is normal — even expected for people who train seriously. But if your Whoop score has been in the red zone consistently for a week or more, something systemic is going on. No amount of morning routines or supplements will resolve it without identifying the actual underlying cause.\n\nChronic red recovery is one of the most common complaints in Whoop communities, and it is almost always driven by one or more of a predictable set of factors. This guide covers the eight most likely reasons your recovery stays red, how to tell which one applies to you, and a practical approach to breaking the pattern.",
    sections: [
      {
        heading: "One Red Day vs. Always Red: A Critical Distinction",
        body: "A single red day is a data point. A week or more of consecutive red days is a pattern — and patterns in Whoop data are almost always meaningful.\n\nThe difference matters because the response is different. One red day after a hard weekend calls for one good recovery night and easy movement the next day. Chronic red recovery calls for identifying and removing the underlying stressor, which a single good night cannot undo.\n\nIf your recovery has been consistently in the red for more than five days, your body is telling you something is out of balance. The Whoop score is reflecting accumulated physiological debt, not a series of independent bad nights. Each day you do not address the root cause, the debt grows slightly larger.",
      },
      {
        heading: "8 Reasons Your Whoop Recovery Is Chronically Low",
        body: "1. Training load is too high relative to recovery capacity. This is the most common cause for active people. If you are training hard most days without adequate easy days or deload weeks, your body accumulates debt faster than it can repay it. Consistent strain scores above 14-16 without green recovery days is a reliable signal.\n\n2. Sleep debt accumulation. Consistently sleeping even 30 to 45 minutes less than your body needs creates a cumulative deficit that suppresses HRV over time. Seven days of slightly short sleep looks very different in Whoop data than one short night.\n\n3. High life stress outside of training. Work pressure, relationship conflict, financial anxiety, and major life transitions all elevate cortisol and suppress HRV. Whoop cannot distinguish training stress from life stress — it measures the physiological outcome either way.\n\n4. Regular alcohol use. Even moderate, consistent alcohol consumption significantly disrupts HRV and sleep architecture. If you drink regularly and your recovery is chronically low, alcohol is very likely a major contributor worth testing by removing for two weeks.\n\n5. Poor sleep quality despite adequate hours. Eight hours of fragmented or unrestorative sleep does not provide the same HRV recovery as seven hours of consolidated, high-quality sleep. If your Whoop sleep performance score is low even when total hours look fine, quality is the issue.\n\n6. Illness or ongoing infection. An immune response — even a mild or subclinical one — consistently suppresses HRV. If you are fighting something, your recovery will stay red until your body clears it. A dropping recovery combined with other symptoms is a meaningful signal.\n\n7. Nutritional deficits. Chronic under-eating, insufficient protein, or low micronutrient status — especially magnesium and zinc — impairs the nervous system's ability to recover properly between sessions.\n\n8. Environmental stressors. A sleep environment that is too warm, too bright, or too noisy; altitude changes; significant time zone disruption; or seasonal health changes all register as recovery-suppressing inputs that Whoop cannot explain but can detect.",
      },
      {
        heading: "When Chronic Red Recovery Warrants More Attention",
        body: "Most cases of chronic red recovery resolve when the underlying stressor is identified and reduced. If yours does not meaningfully improve after two weeks of genuine recovery focus — addressing sleep, alcohol, training load, and stress — it is worth considering other causes.\n\nConsistently suppressed HRV alongside symptoms like persistent fatigue, difficulty concentrating, disrupted mood, or frequent illness can indicate overtraining syndrome, thyroid dysfunction, iron deficiency anemia, or other conditions that benefit from clinical evaluation.\n\nWhoop data is a useful starting point for a conversation with a doctor. Thirty days of recovery trends provide real physiological context about your autonomic nervous system function that can be worth sharing at an appointment.",
      },
      {
        heading: "A 5-Day Recovery Reset to Break Chronic Red",
        body: "If your recovery has been red for a week or more, a structured reset often breaks the pattern within five to seven days:\n\nDays 1-2: Eliminate all hard training. Replace it with walking, easy stretching, or gentle swimming. No alcohol. Target sleep time: your normal bedtime plus 30 to 45 minutes of extra time in bed, not necessarily extra sleep — just more opportunity.\n\nDays 3-5: Reintroduce easy aerobic movement only — zone 2 effort, 30 to 45 minutes maximum. Maintain no alcohol and prioritized sleep timing. Eat well and include adequate protein at every meal.\n\nBy day five to seven, most people with lifestyle-driven chronic red will see a meaningful improvement in recovery scores and HRV trend. If you do not, the stressor is still present. At that point, systematically removing one variable at a time — starting with training load, then alcohol, then sleep environment — will help you isolate the specific cause.",
      },
    ],
    faq: [
      {
        question: "Is it normal for Whoop recovery to be red for a week?",
        answer:
          "It can happen during intense training blocks or illness, but it is not ideal. More than seven to ten consecutive red days without a clear cause warrants a change in approach — either to training load, sleep, or lifestyle factors.",
      },
      {
        question: "Will taking a week off training fix chronic red recovery?",
        answer:
          "Often yes, if training load is the primary driver. But if the cause is sleep debt, alcohol use, or high life stress, addressing those specifically matters more than training rest alone.",
      },
      {
        question: "Does Whoop recovery reset after one good night of sleep?",
        answer:
          "Yes, for occasional dips triggered by a single event. HRV and recovery can rebound substantially after one genuinely good night. Chronic suppression typically requires multiple good nights to clear, because the underlying debt is larger.",
      },
      {
        question:
          "My Whoop recovery has been red for two weeks. Should I see a doctor?",
        answer:
          "If two weeks of genuine recovery focus — reduced training, improved sleep, no alcohol — does not produce meaningful improvement, and especially if you have symptoms like fatigue or mood changes, a clinical conversation is reasonable. Bring your Whoop data as supporting context.",
      },
    ],
    relatedTool: {
      href: "/tools/hrv-optimizer",
      label: "HRV Optimizer",
      description:
        "Enter your Whoop recovery score and HRV trend to get specific guidance on training load, recovery priorities, and next steps.",
    },
    relatedGuides: [
      "whoop-recovery-red-should-i-train",
      "why-is-my-oura-readiness-score-low",
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}

export function getAllSlugs(): string[] {
  return guides.map((g) => g.slug);
}

export function getRelatedGuides(slugs: string[]): Guide[] {
  return slugs
    .map((s) => getGuide(s))
    .filter((g): g is Guide => g !== undefined);
}
