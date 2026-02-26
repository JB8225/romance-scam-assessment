export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { answers, riskLevel } = req.body;

  const prompt = `You are a compassionate expert at The Scam Hotline, a organization dedicated to helping families protect their loved ones from scams. You've just received the results of a concern assessment from a worried adult child.

Here are their answers:
- What triggered their concern: ${answers.trigger || 'not specified'}
- Online relationship present: ${answers.online_relationship || 'not specified'}
- Met in person: ${answers.met_in_person || 'not specified'}
- Money situation: ${answers.money || 'not specified'}
- Behavior changes noticed: ${answers.behavior || 'not specified'}
- Their gut feeling: ${answers.gut || 'not specified'}
- Overall concern level calculated: ${riskLevel}

Write a warm, professional, personalized concern report for this person. The report should:

1. Open with a brief, empathetic paragraph that speaks directly to their specific situation (2-3 sentences). Do NOT start with "Dear" or their name.

2. A section called "What Your Answers Reveal" — 2-3 paragraphs that interpret their specific answers in plain language. Be honest but not alarmist. Acknowledge uncertainty where it exists. If money has been sent, be more urgent. If it's just a gut feeling, be gentle and validating.

3. A section called "The Warning Signs We See" — write 3-5 specific observations based on their answers as short paragraphs, not bullet points. Each should explain WHY it matters, not just what it is.

4. A section called "What Typically Happens Next" — a brief, honest paragraph about how situations like theirs typically evolve if nothing changes. Be truthful but not fear-mongering.

5. A section called "Your Conversation Strategy" — 3-4 specific, actionable pieces of advice for how to approach their parent. Emphasize relationship preservation. Include what NOT to say.

6. Close with a warm, encouraging paragraph that positions The Scam Hotline as their resource. Mention that their free guides (5 Questions to Ask Your Parent This Weekend and the Family Conversation Starter) are on their way to their inbox. Sign off from JB Bouck, Founder of The Scam Hotline.

Tone: Warm, knowledgeable, like a trusted advisor who has seen this before and knows how to help. Never condescending. Never preachy. Speak to them as an equal who is worried about someone they love.

Do not use bullet points anywhere. Write in paragraphs throughout. Keep the total length to around 600-800 words.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const reportText = data.content[0].text;
    return res.status(200).json({ report: reportText });

  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Failed to generate report' });
  }
}
