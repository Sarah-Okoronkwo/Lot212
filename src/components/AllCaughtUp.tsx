'use client';

import DailyStoryArchive from '@/components/DailyStoryArchive';
import { Story } from '@/types';

interface DayGroup {
  date: string;
  stories: Story[];
}

interface AllCaughtUpProps {
  groups?: DayGroup[];
}

export default function AllCaughtUp({ groups = [] }: AllCaughtUpProps) {
  return <DailyStoryArchive groups={groups} />;
}