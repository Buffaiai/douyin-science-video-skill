import React from 'react';
import { Composition } from 'remotion';
import { Video } from './Video';
import { FPS, TOTAL_FRAMES } from './timing';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="__COMP_ID__"
    component={Video}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
