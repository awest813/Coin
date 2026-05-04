export type ChronicleEntryType = 
  | 'mission_success' 
  | 'artifact_forged' 
  | 'hero_recruited' 
  | 'room_upgraded' 
  | 'milestone_reached' 
  | 'member_lost';

export interface ChronicleEntry {
  id: string;
  timestamp: string;
  type: ChronicleEntryType;
  title: string;
  description: string;
  icon: string;
}
