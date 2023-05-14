import { NextApiRequest, NextApiResponse } from 'next';

import { BskyAgent } from '@atproto/api';
import labels from './labelDescriptions.json';
import { env } from 'process';

const agent = new BskyAgent({ service: env.BSKY_SERVICE as string });
const _ = await agent.login({
  identifier: env.BSKY_IDENTIFIER as string,
  password: env.BSKY_PASSWORD as string,
});
// for some reason it doesn't work unless I assign the return to a value...

const unknownLabel = {
  id: 'unknown',
  description: 'The label effect is unknown at this time',
  color: 'green',
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await agent.getProfile({
      actor: req.query.handle as string,
    });

    const labelResponse = response.data.labels?.map((retLabel: any) => {
      const newLabel = labels.find((label) => label.id === retLabel.val);
      if (newLabel) {
        return newLabel;
      }
      return {
        id: retLabel.val,
        description: unknownLabel.description,
        color: unknownLabel.color,
      };
    });
    res.json({ labelList: labelResponse, error: '' });
  } catch (error: any) {
    if ('status' in error) {
      res.status(error.status);
    }
    if ('message' in error) {
      res.json({
        labelList: [],
        error: error.message,
      });
    } else {
      res.json({
        labelList: [],
        error: 'Error: Unknown Error',
        errorRaw: error,
      });
    }
  }
}
