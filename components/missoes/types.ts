export interface Mission {
  id: number;
  title: string;
  description: string | null;
  type: string;
  target_value: number;
  reward_packs: number;
  reward_points: number;
  theme: string;
  instructions: string | null;
  action_label: string | null;
  action_href: string | null;
  progress_unit: string | null;
  progress: number;
  completed_at: string | null;
  reward_claimed: boolean;
}

export interface MissionsSummary {
  completed_count: number;
  available_count: number;
  packs_earned: number;
  rank_position: number | null;
}

export interface MissionsResponse {
  missions: Mission[];
  summary: MissionsSummary;
}
