import create from 'zustand';

import { DASHBOARD_PAGE_GUIDES } from 'config/references';

const guideStore = create<{
  shuffled: boolean;
  guideLinks: any;
  shuffle: () => void;
}>((set) => ({
  shuffled: false,
  guideLinks: [{}],
  shuffle: () => {
    const guideLinks = DASHBOARD_PAGE_GUIDES;
    const shuffledLinks = guideLinks
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
    set({ shuffled: true, guideLinks: shuffledLinks });
  },
}));
export default guideStore;
