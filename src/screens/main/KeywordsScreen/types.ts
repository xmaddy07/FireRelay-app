export type KeywordDescriptionLevel = 'normal' | 'critical';

export type KeywordRecord = {
  id: string;
  name: string;
  active: boolean;
  description: string;
  descriptionLevel: KeywordDescriptionLevel;
  createdAt: string;
  isCritical?: boolean;
};
