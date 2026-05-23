import { TwitterApi } from 'twitter-api-v2'

export function getAppClient() {
  return new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_SECRET!,
  })
}

export function getUserClient(accessToken: string, accessSecret: string) {
  return new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_SECRET!,
    accessToken,
    accessSecret,
  })
}

export async function postTweet(
  accessToken: string,
  accessSecret: string,
  content: string
): Promise<string> {
  const client = getUserClient(accessToken, accessSecret)
  const tweet = await client.v2.tweet(content)
  return tweet.data.id
}

export async function getAuthLink(callbackUrl: string) {
  const client = getAppClient()
  const link = await client.generateAuthLink(callbackUrl, { linkMode: 'authorize' })
  return link
}

export async function getAccessToken(
  oauthToken: string,
  oauthVerifier: string,
  oauthTokenSecret: string
) {
  const client = new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_SECRET!,
    accessToken: oauthToken,
    accessSecret: oauthTokenSecret,
  })
  return client.login(oauthVerifier)
}
