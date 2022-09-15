import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

import { convertHourStringToMinutes } from './utils/convert-hour-sting-to-minutes';
import { convertMinutesToHourString } from './utils/convert-minutes-to-hour-string';

const app = express();

app.use(express.json());
app.use(cors());

const prisma = new PrismaClient({
  log: ['query'],
});

app.get('/games', async (req, res) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        },
      },
    },
  });

  return res.json(games);
});

app.post('/games/:id/ads', async (req, res) => {
  const gameId = req.params.id;

  const body = req.body;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      hourEnd: convertHourStringToMinutes(body.hourEnd),
      hourStart: convertHourStringToMinutes(body.hourStart),
      discord: body.discord,
      useVoiceChannel: body.useVoiceChannel,
      weekDays: body.weekDays.join(','),
    },
  });

  return res.json(ad);
});

app.get('/games/:id/ads', async (req, res) => {
  const gameId = req.params.id;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourEnd: true,
      hourStart: true,
    },
    where: {
      gameId,
    },
    orderBy: {
      createAt: 'desc',
    },
  });

  let formattedAds = ads.map((ad) => {
    return {
      ...ad,
      weekDays: ad.weekDays.split(','),
      hourStart: convertMinutesToHourString(ad.hourStart),
      hourEnd: convertMinutesToHourString(ad.hourEnd),
    };
  });

  return res.json(formattedAds);
});

app.get('/games/:id/discord', async (req, res) => {
  const adId = req.params.id;

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true,
    },
    where: {
      id: adId,
    },
  });

  return res.json({
    discord: ad.discord,
  });
});

app.post('/ads', (req, res) => {
  return res.json([]);
});

app.get('/ads', (req, res) => {
  return res.json([]);
});

app.listen(3333);
