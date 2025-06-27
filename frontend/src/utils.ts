type Player = {
  id: number;
  name: string;
  created_at: string;
};

type Match = {
  id: number;
  player_a_id: number;
  player_b_id: number;
  score_a: number;
  score_b: number;
  played_at: string;
};

export type { Player, Match };
