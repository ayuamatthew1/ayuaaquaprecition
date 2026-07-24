
type PondType = "EARTHEN" | "CONCRETE" | "TARPAULIN" | "FIBER" | "PLASTIC";

interface PondFishBatch {
  species: string | null;
  quantity: number;
}

export interface PondWithFishBatch {
  id: string;
  name: string;
  type: PondType;
  capacity: number | null;
  waterVolume: number | null;
  device: { id: string, name: string } | null;
  fishBatches: PondFishBatch[];
}