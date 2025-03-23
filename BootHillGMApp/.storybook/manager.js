// .storybook/manager.js
import { addons } from '@storybook/manager-api';

// Configure Storybook's UI panel settings
addons.setConfig({
  // Reduce sidebar width
  sidebar: {
    showRoots: true,
  },
  // Improve initial performance by reducing UI features
  enableShortcuts: true,
  initialActive: 'canvas',
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: true },
    copy: { hidden: false },
    fullscreen: { hidden: false },
  },
});