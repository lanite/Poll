export interface PollOption {
  id: string
  text: string
  emoji?: string
  color?: string
}

export interface PollSettings {
  show_results_before_vote?: boolean
  allow_multiple?: boolean
  require_comment?: boolean
}

export interface Poll {
  id: string
  slug: string
  title: string
  description?: string
  options: PollOption[]
  template: 'standard' | 'versus' | 'ranked' | 'emoji-only' | 'hot-take'
  theme: string
  total_votes: number
  share_count: number
  is_active: boolean
  ends_at?: string
  created_at: string
  settings: PollSettings
}

export interface VoteResult {
  option_index: number
  vote_count: number
  percentage: number
}

export interface RawResult {
  option_index: number
  vote_count: number | string
}
