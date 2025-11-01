export interface BuildRequirement {
  item: string;
  amount: number;
}

export type FactoryBuildRequirements = {
  [factoryId: string]: BuildRequirement[];
};

