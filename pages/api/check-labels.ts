import { NextApiRequest, NextApiResponse } from 'next';

import { BskyAgent, ComAtprotoLabelDefs } from '@atproto/api';
import { AtUri, AppBskyFeedDefs } from '@atproto/api';
import { XRPCInvalidResponseError } from '@atproto/xrpc';
import labelsMap from './labelDescriptions.json';
import { env } from 'process';

const agent = new BskyAgent({ service: env.BSKY_SERVICE as string });
const _ = await agent.login({
  identifier: env.BSKY_IDENTIFIER as string,
  password: env.BSKY_PASSWORD as string,
}); // eslint-disable-line @typescript-eslint/no-unused-vars
// for some reason it doesn't work unless I assign the return to a value...

const postRegex = /^.*[b|p]sky.app\/profile\/(.*?)\/post\/(.*?)$/;

const unknownLabel = {
  id: 'unknown',
  description: 'The label effect is unknown at this time',
  color: 'green',
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const checkee =
    req.query.checkee instanceof Array<string>
      ? req.query.checkee[0]
      : req.query.checkee;
  // this shouldn't ever happen, but to stop it from thinking it might be undefined
  if (checkee === undefined) {
    res.status(400);
    res.json({ labelList: [], error: 'Invalid input' });
    return;
  }
  if (checkee?.substring(0, 1) == '@') {
    await checkHandle(checkee.substring(1), res);
  } else if (checkee?.substring(0, 6) == 'did:plc:') {
    await checkHandle(checkee, res);
  } else if (checkee?.substring(0, 5) == 'at://') {
    const test = new AtUri(checkee);
    if (test.collection == 'app.bsky.feed.post') {
      await checkPost(test, res);
    }
  } else if (postRegex.test(checkee)) {
    const match = checkee.match(postRegex);
    let handle = match?.[1];
    const rkey = match?.[2];
    if (!match?.[1].startsWith('did:plc')) {
      try {
        const handleResp = await agent.resolveHandle({ handle: handle });
        handle = handleResp.data.did;
      } catch {
        res.status(404);
        res.json({
          labelList: [],
          error: 'Error: Unable to resolve handle for post',
        });
        return;
      }
    }
    const atString = `at://${handle}/app.bsky.feed.post/${rkey}`;
    await checkPost(new AtUri(atString), res);
  } else {
    await checkHandle(checkee as string, res);
  }
}

async function checkHandle(handle: string, res: NextApiResponse) {
  try {
    const response = await agent.getProfile({
      actor: handle as string,
    });

    res.json({
      labelList: decorateLabels(
        response.data.labels as ComAtprotoLabelDefs.Label[]
      ),
      error: '',
    });
  } catch (error) {
    if (error instanceof XRPCInvalidResponseError) {
      res.status(error.status);
      res.json({
        labelList: [],
        error: error.message,
      });
    }
  }
}

async function checkPost(post: AtUri, res: NextApiResponse) {
  try {
    const resp = await agent.getPostThread({ uri: post.toString(), depth: 0 });
    resp.data.thread.post;
    if (AppBskyFeedDefs.isThreadViewPost(resp.data.thread)) {
      const labels = resp.data.thread.post.labels || [];
      res.json({
        labelList: decorateLabels(labels),
        error: '',
      });
    } else if (AppBskyFeedDefs.isBlockedPost(resp.data.thread)) {
      res.status(400);
      res.json({
        labelList: [],
        error:
          'Error: Cannot get data as @cloudhunter.co.uk has been blocked by the user',
      });
    } else {
      res.status(404);
      res.json({
        labelList: [],
        error: 'Error: Post not found',
      });
    }
  } catch (error) {
    if (error instanceof XRPCInvalidResponseError) {
      res.status(error.status);
      res.json({
        labelList: [],
        error: error.message,
      });
    }
  }
}

function decorateLabels(labels: ComAtprotoLabelDefs.Label[]) {
  const labelResponse = labels?.map((retLabel: ComAtprotoLabelDefs.Label) => {
    const newLabel = labelsMap.find((label) => label.id === retLabel.val);
    if (newLabel) {
      return newLabel;
    }
    return {
      id: retLabel.val,
      description: unknownLabel.description,
      color: unknownLabel.color,
    };
  });
  return labelResponse;
}
