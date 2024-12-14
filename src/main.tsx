import "./createPost.js";

import { Devvit, useState } from "@devvit/public-api";
import { Service } from "./service/service.js";
// Defines the messages that are exchanged between Devvit and Web View
type WebViewMessage =
  | {
      type: "initialData";
      data: { username: string; currentCounter: number; played: boolean };
    }
  | {
      type: "updateScore";
      data: { score: number };
    };

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: "Webview Example",
  height: "tall",
  render: (context) => {
    // Load username with `useAsync` hook
    const [username] = useState(async () => {
      const currUser = await context.reddit.getCurrentUser();
      return currUser?.username ?? "anon";
    });
    const service = new Service(context);
    // Load latest counter from redis with `useAsync` hook
    const [counter, setCounter] = useState(async () => {
      const redisCount = await context.redis.get(`counter_${context.postId}`);
      if (redisCount && redisCount !== "" && redisCount !== undefined) {
        return Number(redisCount);
      } else {
        const randNum = Number(Math.floor(Math.random() * 3790));
        await context.redis.set(
          `counter_${context.postId}`,
          randNum.toString()
        );
        return randNum;
      }
    });
    const [hasPlayed, setHasPlayed] = useState(async () => {
      const redisCount = await context.redis.get(`score_${context.postId}`);
      if (
        redisCount &&
        redisCount !== "" &&
        redisCount !== undefined &&
        redisCount !== "0"
      ) {
        return true;
      } else {
        return false;
      }
    });
    const [scores, setScores]: any[] | any = useState(async () => {
      const redisCount = await service.getScores(5);
      return redisCount ?? 0;
    });
    const [score, setScore] = useState(async () => {
      const redisCount = await service.getUserScore(username);
      return redisCount.score ?? 0;
    });
    // Create a reactive state for web view visibility
    const [webviewVisible, setWebviewVisible] = useState(false);
    const [webviewVisible2, setWebviewVisible2] = useState(false);
    const [webviewVisible4, setWebviewVisible4] = useState(false);
    const [webviewVisible3, setWebviewVisible3] = useState(true);

    // When the web view invokes `window.parent.postMessage` this function is called
    const onMessage = async (msg: WebViewMessage) => {
      switch (msg.type) {
        case "initialData":
          break;
        case "updateScore":
          await context.redis.set(
            `score_${context.postId}`,
            msg.data.score.toString()
          );
          service.addToUserScore(username, msg.data.score);
          break;
        default:
          throw new Error(`Unknown message type`);
      }
    };

    // When the button is clicked, send initial data to web view and show it
    const onShowWebviewClick = () => {
      setWebviewVisible(true);
      setWebviewVisible2(false); //how to plar
      setWebviewVisible3(false); //actual menu
      setWebviewVisible4(false); //leaderboard
      context.ui.webView.postMessage("myWebView", {
        type: "initialData",
        data: {
          username: username,
          currentCounter: Number(counter),
          played: hasPlayed,
        },
      });
    };
    const onShowWebviewClick2 = () => {
      setWebviewVisible(false); //game
      setWebviewVisible2(true); //how to plar
      setWebviewVisible3(false); //actual menu
      setWebviewVisible4(false); //leaderboard
    };
    const onShowWebviewClick3 = () => {
      //back button
      setWebviewVisible(false); //game
      setWebviewVisible2(false);
      setWebviewVisible3(true);
      setWebviewVisible4(false);
    };
    const onShowLeaderboard = () => {
      setWebviewVisible(false); //game
      setWebviewVisible2(false);
      setWebviewVisible3(false);
      setWebviewVisible4(true);
    };
    // Render the custom post type
    return (
      <vstack grow padding="small">
        {webviewVisible3 && (
          <zstack width="100%" height={webviewVisible3 ? "100%" : "0%"} alignment="middle center">
            <image
              imageHeight={1024}
              imageWidth={1500}
              height="100%"
              width="100%"
              url={"https://i.redd.it/wbqltwhuwt6e1.png"}
              description="striped blue background"
              resizeMode="cover"
            />
            <vstack
          
              height={webviewVisible3 ? "100%" : "0%"}
              alignment="middle center"
              padding="large"
            >
              <text size="xxlarge" weight="bold" color="white">
                Sub-Scramble
              </text>
              <spacer />
              <spacer />
              <button
                appearance="plain"
                width="150px"
                onPress={onShowWebviewClick2}
              >
                Rules
              </button>
              <spacer />
              <button
                appearance="primary"
                width="150px"
                onPress={onShowWebviewClick}
              >
                Play
              </button>
              <spacer />
              <button
                appearance="secondary"
                width="150px"
                onPress={onShowLeaderboard}
              >
                Leaderboard
              </button>
            </vstack>
          </zstack>
        )}
        {webviewVisible2 && (
          <vstack alignment="center middle" height="100%" gap="medium">
            <button onPress={onShowWebviewClick3}>Back</button>
            <text size="xxlarge" weight="bold">
              Welcome to Sub-Scramble!👋
            </text>

            <text size="medium" weight="bold">
              Rules are simple.
            </text>
            <text size="medium" weight="bold">
              Subreddit names will appear scrambled. 
            </text>
            <text size="medium" weight="bold">
             The image icon of the subreddit is your clue.
            </text>
            <text size="medium" weight="bold">
              Guess the subreddit name and win 100 points for each correct
              guess.
            </text>
            <text size="medium" weight="bold">
              Unlimited attempts. But single score update for each post.
            </text>
            <text size="medium" weight="bold">
              Make your way to the leaderboard. But most importantly, enjoy! 😉
            </text>
          </vstack>
        )}
        {webviewVisible4 && (
          <zstack width="100%" height="100%" alignment="middle center">
          <image
            imageHeight={1024}
            imageWidth={1500}
            height="100%"
            width="100%"
            url={"https://i.redd.it/jx613gv3zt6e1.png"}
            description="striped blue background"
            resizeMode="cover"
          />
          <vstack
            alignment="center top"
            height="100%"
            gap="small"
          >
            <text size="xxlarge" weight="bold" color="black">
              Leaderboard! 🥳🎉
            </text>
            <text size="xlarge" weight="bold" color="black">
              (Lifetime score)
            </text>
            {scores &&
              scores.map((obj: any, index: number) => (
                <vstack alignment="start middle">
                  <hstack>
                    <text size="xlarge" color="black">
                      {" "}
                      🎉 {index + 1}.
                    </text>
                    <spacer />
                    <text size="xlarge" color="black" weight="bold">
                      {" "}
                      {obj.member}
                    </text>
                    <spacer />
                    <text size="xlarge" color="black" weight="bold">
                      {" "}
                      - {obj.score}
                    </text>
                  </hstack>
                </vstack>
              ))}
            <button onPress={onShowWebviewClick3}>Back</button>
          </vstack>
          </zstack>
        )}
        <vstack grow={webviewVisible} height={webviewVisible ? "100%" : "0%"}>
          <vstack
            border="thick"
            borderColor="black"
            height={webviewVisible ? "100%" : "0%"}
          >
            <webview
              id="myWebView"
              url="page.html"
              onMessage={(msg) => onMessage(msg as WebViewMessage)}
              grow
              height={webviewVisible ? "100%" : "0%"}
            />
          </vstack>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
