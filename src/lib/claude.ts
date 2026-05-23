import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export type GeneratedPost = {
  content: string
  scheduledMinutesFromNow: number
}

export async function generatePosts(
  theme: string,
  description: string,
  tone: string,
  language: string,
  count = 5
): Promise<GeneratedPost[]> {
  const langLabel = language === 'ja' ? '日本語' : 'English'
  const prompt = `あなたはX（旧Twitter）のマーケティング専門家です。

テーマ: ${theme}
詳細: ${description}
トーン: ${tone}
言語: ${langLabel}

上記のテーマで、インプレッションを最大化するための投稿を${count}件生成してください。

ルール:
- 各投稿は280文字以内（日本語は140文字以内）
- エンゲージメントを高めるために、問いかけ・共感・情報提供などを混ぜる
- 投稿間の間隔も最適化する（最初は30分後、次は2時間後、など）
- ハッシュタグを適切に使用する

以下のJSON形式のみで回答すること（説明文は不要）:
[
  {"content": "投稿内容", "scheduledMinutesFromNow": 30},
  {"content": "投稿内容2", "scheduledMinutesFromNow": 150}
]`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('AI response parsing failed')

  return JSON.parse(jsonMatch[0]) as GeneratedPost[]
}
