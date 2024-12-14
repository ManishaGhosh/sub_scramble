import {
  ZRangeOptions,
  type Post,
  type RedditAPIClient,
  type RedisClient,
  type Scheduler,
} from '@devvit/public-api';
export type ScoreBoardEntry = {
  member: string;
  score: number;
  description?: string;
};

export class Service {
  readonly redis: RedisClient;
  readonly reddit?: RedditAPIClient;
  readonly scheduler?: Scheduler;

  constructor(context: { redis: RedisClient; reddit?: RedditAPIClient; scheduler?: Scheduler }) {
    this.redis = context.redis;
    this.reddit = context.reddit;
    this.scheduler = context.scheduler;
  }
//** User Scoring */
readonly scoresKeyTag: string = 'default';
readonly #scoreKey: string = `score:${this.scoresKeyTag}`;

async getScores(maxLength: number = 10): Promise<ScoreBoardEntry[]> {
  const options: ZRangeOptions = { reverse: true, by: 'rank' };
  return await this.redis.zRange(this.#scoreKey, 0, maxLength - 1, options);
}

async getUserScore(username?: string): Promise<{
  rank: number;
  score: number;
}> {
  const defaultValue = { rank: -1, score: 0 };
  if (!username) return defaultValue;
  try {
    const [rank, score] = await Promise.all([
      this.redis.zRank(this.#scoreKey, username),
      this.redis.zScore(this.#scoreKey, username),
    ]);
    if (score === undefined) {
      await this.addNewPlayer(username);
      return {  
        rank: -1,
        score: 0,
      }
    }
    return {
      rank: rank === undefined ? -1 : rank,
      score: score === undefined  ? 0 : score,
    };
  } catch (error) {
    if (error) {
      console.error('Error fetching user score board entry', error);
    }
    return defaultValue;
  }
}

async addToUserScore(username: string, amount: number): Promise<void> {
  console.log('Adding', amount, 'to', username);
  await this.redis.zIncrBy(this.#scoreKey, username, amount);
}

async removeFromUserScore(username: string, amount: number): Promise<void> {
  console.log('Removing', amount, 'from', username);
  await this.redis.zIncrBy(this.#scoreKey, username, -amount);
}

private async addNewPlayer(username: string): Promise<void> {
  const initialScore = 0;
  await this.addToUserScore(username, initialScore);
}
}